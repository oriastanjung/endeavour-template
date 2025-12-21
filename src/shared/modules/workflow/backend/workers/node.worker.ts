// src/shared/modules/workflow/backend/workers/node.worker.ts
// BullMQ worker for processing individual node runs

import { Worker, Job } from "bullmq";
import { redisConnection } from "@/backend/modules/shared/bullmq/connections/redis";
import { db } from "@/shared/database";
import { nodeRegistry } from "@/shared/modules/workflow/config/nodeRegistry";
import { createRenderer, type TemplateContext } from "../engine/templating";
import { computeNextNodes } from "../engine/graph";
import {
  publishNodeRunUpdate,
  publishStateUpdate,
  publishExecutionCompleted,
} from "../queue/events";
import { addNodeJob } from "../queue";
import type { NodeJobData, NodeActionContext } from "../types";

/**
 * Start the node worker
 */
export function startNodeWorker(options?: { concurrency?: number }) {
  const concurrency = options?.concurrency ?? 5;

  const worker = new Worker<NodeJobData>(
    "node_queue",
    async (job: Job<NodeJobData>) => {
      const { executionId, workflowId, nodeId } = job.data;
      console.log(
        `[NodeWorker] Processing node ${nodeId} for execution ${executionId}`
      );

      const debugNode = await db.workflowNode.findUnique({
        where: { id: nodeId },
      });
      console.log(
        `[NodeWorker] DEBUG Direct Node Fetch:`,
        JSON.stringify(debugNode?.config)
      );

      // Find or create node run
      let nodeRun = await db.workflowNodeRun.findFirst({
        where: { executionId, nodeId },
        include: { node: true, execution: true },
      });

      if (!nodeRun) {
        nodeRun = await db.workflowNodeRun.create({
          data: {
            executionId,
            workflowId,
            nodeId,
            status: "PENDING",
          },
          include: { node: true, execution: true },
        });
      }

      // Update to RUNNING
      nodeRun = await db.workflowNodeRun.update({
        where: { id: nodeRun.id },
        data: { status: "RUNNING", startedAt: new Date() },
        include: { node: true, execution: true },
      });

      publishNodeRunUpdate(executionId, nodeRun.id, "RUNNING", {
        nodeId,
        startedAt: nodeRun.startedAt,
      });

      // Get workflow with nodes and edges
      const workflow = await db.workflow.findUnique({
        where: { id: workflowId },
        include: { nodes: true, edges: true },
      });

      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      // Build context from prior node runs
      const priorNodeRuns = await db.workflowNodeRun.findMany({
        where: { executionId, status: "SUCCESS" },
        include: { node: true },
      });

      const nodesContext: TemplateContext["nodes"] = {};
      for (const run of priorNodeRuns) {
        nodesContext[run.nodeId] = {
          input: run.input,
          output: run.output,
        };
      }

      const executionState =
        (nodeRun.execution.stateOut as Record<string, unknown>) ?? {};

      const templateContext: TemplateContext = {
        state: executionState,
        nodes: nodesContext,
      };

      const render = createRenderer(templateContext);

      // Build action context
      const actionContext: NodeActionContext = {
        executionId,
        workflowId,
        nodeId,
        runId: nodeRun.id,
        state: executionState,
        render,
        log: async (level, message, data) => {
          console.log(`[NodeWorker][${level}] ${message}`, data);
        },
        saveState: async (patch) => {
          const execution = await db.workflowExecution.findUnique({
            where: { id: executionId },
          });
          const currentState =
            (execution?.stateOut as Record<string, unknown>) ?? {};
          const merged = { ...currentState, ...patch };
          await db.workflowExecution.update({
            where: { id: executionId },
            data: { stateOut: merged as object },
          });
          publishStateUpdate(executionId, merged);
        },
      };

      try {
        // Get registry entry for this node type
        const registryEntry = nodeRegistry[nodeRun.node.type];
        if (!registryEntry) {
          throw new Error(`Unknown node type: ${nodeRun.node.type}`);
        }

        // Execute node action
        const input = nodeRun.node.config;
        console.log(
          `[NodeWorker] Executing action for ${nodeRun.node.type} with input:`,
          JSON.stringify(input, null, 2)
        );
        const result = await registryEntry.action(input, actionContext);

        // Update node run as SUCCESS
        await db.workflowNodeRun.update({
          where: { id: nodeRun.id },
          data: {
            status: "SUCCESS",
            finishedAt: new Date(),
            input: input as object,
            output: result?.output as object,
          },
        });

        publishNodeRunUpdate(executionId, nodeRun.id, "SUCCESS", {
          nodeId,
          output: result?.output,
          finishedAt: new Date(),
        });

        // Find and enqueue next nodes
        const nextNodes = computeNextNodes(
          workflow.nodes,
          workflow.edges,
          nodeId,
          result?.nextEdgeLabel
        );

        for (const nextNode of nextNodes) {
          // Create pending node run
          const nextNodeRun = await db.workflowNodeRun.create({
            data: {
              executionId,
              workflowId,
              nodeId: nextNode.id,
              status: "PENDING",
            },
          });

          publishNodeRunUpdate(executionId, nextNodeRun.id, "PENDING", {
            nodeId: nextNode.id,
          });

          // Enqueue for processing
          await addNodeJob(nextNode.type, {
            executionId,
            workflowId,
            nodeId: nextNode.id,
          });
        }

        // Check if execution is complete
        const remaining = await db.workflowNodeRun.count({
          where: {
            executionId,
            status: { in: ["PENDING", "RUNNING"] },
          },
        });

        if (remaining === 0) {
          await db.workflowExecution.update({
            where: { id: executionId },
            data: { status: "SUCCESS", finishedAt: new Date() },
          });
          publishExecutionCompleted(executionId, "SUCCESS");
        }

        return result;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // Update node run as FAILED
        await db.workflowNodeRun.update({
          where: { id: nodeRun.id },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
            error: { message: errorMessage },
          },
        });

        publishNodeRunUpdate(executionId, nodeRun.id, "FAILED", {
          nodeId,
          error: errorMessage,
          finishedAt: new Date(),
        });

        // Mark execution as FAILED
        await db.workflowExecution.update({
          where: { id: executionId },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
            error: { message: errorMessage },
          },
        });

        publishExecutionCompleted(executionId, "FAILED", {
          message: errorMessage,
        });

        throw error;
      }
    },
    { connection: redisConnection, concurrency }
  );

  // Event handlers
  worker.on("active", (job) => {
    console.log(`[NodeWorker] Active: ${job.id}`);
  });

  worker.on("completed", (job, result) => {
    console.log(`[NodeWorker] Completed: ${job.id}`, result);
  });

  worker.on("failed", (job, error) => {
    console.error(`[NodeWorker] Failed: ${job?.id}`, error.message);
  });

  worker.on("error", (error) => {
    console.error(`[NodeWorker] Error:`, error);
  });

  console.log(`[NodeWorker] Started with concurrency=${concurrency}`);

  return worker;
}
