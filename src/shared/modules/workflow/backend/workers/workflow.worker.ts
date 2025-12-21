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
  const triggers = await db.trigger.findMany({
    where: {
      type: "cron",
      isActive: true,
      workflow: { isActive: true },
    },
    include: { workflow: true },
  });

  console.log(`[WorkflowWorker] Registering ${triggers.length} cron triggers`);

  for (const trigger of triggers) {
    if (!trigger.cronExpr) continue;

    const jobId = `cron-${trigger.id}`;

    // Remove existing repeatable job if any
    const repeatableJobs = await workflowQueue.getRepeatableJobs();
    const existing = repeatableJobs.find((j) => j.id === jobId);
    if (existing) {
      await workflowQueue.removeRepeatableByKey(existing.key);
    }

    // Add new repeatable job
    await workflowQueue.add(
      "cron",
      { workflowId: trigger.workflowId },
      {
        repeat: {
          pattern: trigger.cronExpr,
          tz: trigger.timezone ?? "UTC",
        },
        jobId,
      }
    );

    console.log(
      `[WorkflowWorker] Registered cron trigger for workflow ${trigger.workflowId}: ${trigger.cronExpr}`
    );
  }
}
