// src/shared/modules/workflow/backend/workers/workflow.worker.ts
// BullMQ worker for workflow execution orchestration

import { Worker, Job } from "bullmq";
import { redisConnection } from "@/backend/modules/shared/bullmq/connections/redis";
import { db } from "@/shared/database";
import { getStartNodes } from "../engine/graph";
import { addNodeJob, workflowQueue } from "../queue";
import { publishNodeRunUpdate } from "../queue/events";
import type { WorkflowJobData } from "../types";

/**
 * Start the workflow worker
 */
export function startWorkflowWorker(options?: { concurrency?: number }) {
  const concurrency = options?.concurrency ?? 3;

  const worker = new Worker<WorkflowJobData>(
    "workflow_queue",
    async (job: Job<WorkflowJobData>) => {
      const { workflowId, executionId, stateIn } = job.data;
      console.log(`[WorkflowWorker] Processing workflow ${workflowId}`);

      // If executionId provided, this is continuing an existing execution
      if (executionId) {
        const execution = await db.workflowExecution.findUnique({
          where: { id: executionId },
          include: { workflow: { include: { nodes: true, edges: true } } },
        });

        if (!execution) {
          throw new Error(`Execution ${executionId} not found`);
        }

        // Find pending start nodes and enqueue them
        const startNodes = getStartNodes(execution.workflow.nodes);
        for (const node of startNodes) {
          await addNodeJob(node.type, {
            executionId: execution.id,
            workflowId: execution.workflowId,
            nodeId: node.id,
          });
        }

        return { executionId };
      }

      // New execution - create it
      const workflow = await db.workflow.findUnique({
        where: { id: workflowId },
        include: { nodes: true, edges: true },
      });

      if (!workflow || !workflow.isActive) {
        throw new Error(`Workflow ${workflowId} not found or inactive`);
      }

      // Create execution
      const execution = await db.workflowExecution.create({
        data: {
          workflowId,
          triggerType: job.name === "cron" ? "cron" : "manual",
          status: "RUNNING",
          startedAt: new Date(),
          stateIn: (stateIn ?? {}) as object,
          stateOut: {},
        },
      });

      console.log(`[WorkflowWorker] Created execution ${execution.id}`);

      // Get start nodes
      const startNodes = getStartNodes(workflow.nodes);

      if (startNodes.length === 0) {
        await db.workflowExecution.update({
          where: { id: execution.id },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
            error: { message: "No trigger nodes found" },
          },
        });
        throw new Error("No trigger nodes found in workflow");
      }

      // Create node runs and enqueue
      for (const node of startNodes) {
        const nodeRun = await db.workflowNodeRun.create({
          data: {
            executionId: execution.id,
            workflowId,
            nodeId: node.id,
            status: "PENDING",
          },
        });

        publishNodeRunUpdate(execution.id, nodeRun.id, "PENDING", {
          nodeId: node.id,
        });

        await addNodeJob(node.type, {
          executionId: execution.id,
          workflowId,
          nodeId: node.id,
        });
      }

      return { executionId: execution.id };
    },
    { connection: redisConnection, concurrency }
  );

  // Event handlers
  worker.on("active", (job) => {
    console.log(`[WorkflowWorker] Active: ${job.id}`);
  });

  worker.on("completed", (job, result) => {
    console.log(`[WorkflowWorker] Completed: ${job.id}`, result);
  });

  worker.on("failed", (job, error) => {
    console.error(`[WorkflowWorker] Failed: ${job?.id}`, error.message);
  });

  worker.on("error", (error) => {
    console.error(`[WorkflowWorker] Error:`, error);
  });

  console.log(`[WorkflowWorker] Started with concurrency=${concurrency}`);

  return worker;
}

/**
 * Register cron triggers from database
 */

export async function registerCronTriggers() {
  const activeWorkflows = await db.workflow.findMany({
    where: { isActive: true },
    include: {
      nodes: { where: { type: "cron.trigger" } },
    },
  });

  // Map: cron-NodeId -> Config
  const desiredConfig = new Map<
    string,
    {
      workflowId: string;
      cron: string;
      tz: string;
      nodeId: string;
    }
  >();

  activeWorkflows.forEach((wf) => {
    wf.nodes.forEach((node) => {
      const cfg = node.config as { cronExpression?: string; timezone?: string };
      if (cfg.cronExpression) {
        desiredConfig.set(`cron.trigger-${node.id}`, {
          workflowId: wf.id,
          cron: cfg.cronExpression,
          tz: cfg.timezone ?? "UTC",
          nodeId: node.id,
        });
      }
    });
  });

  const existingJobs = await workflowQueue.getRepeatableJobs();
  // DEBUG: Inspect what jobs we are getting
  console.log(
    "[WorkflowWorker] Raw Existing Jobs:",
    JSON.stringify(
      existingJobs.map((j) => ({ id: j.id, key: j.key, pattern: j.pattern })),
      null,
      2
    )
  );

  // Check ALL jobs to ensure ghosts are removed
  const myJobs = existingJobs;

  for (const job of myJobs) {
    const jobId = job.id || "unknown";
    const target = desiredConfig.get(jobId);

    if (!target) {
      // Deleted or Ghost
      if (job.key) {
        await workflowQueue.removeRepeatableByKey(job.key);
        console.log(`[WorkflowWorker] Removed (Deleted/Ghost): ${jobId}`);
      }
    } else {
      // Check for changes
      const isPatternSame = job.pattern === target.cron;
      const isTzSame = job.tz === target.tz;

      if (!isPatternSame || !isTzSame) {
        // Changed
        if (job.key) {
          await workflowQueue.removeRepeatableByKey(job.key);
          console.log(`[WorkflowWorker] Removed (Changed): ${jobId}`);
        }
        // We leave it in desiredConfig map, so it gets added below
      } else {
        // Unchanged - Remove from map so we don't add it again
        desiredConfig.delete(jobId);
      }
    }
  }

  // 2. Add remaining jobs in map (New or Updated)
  for (const [jobId, config] of desiredConfig.entries()) {
    await workflowQueue.add(
      "cron",
      { workflowId: config.workflowId, nodeId: config.nodeId },
      {
        repeat: { pattern: config.cron, tz: config.tz },
        jobId: jobId,
      }
    );
    console.log(`[WorkflowWorker] Added/Updated: ${jobId} ${config.cron}`);
  }
}
