// src/shared/modules/workflow/backend/queue/index.ts
// BullMQ queue instances for workflow execution

import { Queue, QueueEvents } from "bullmq";
import { redisConnection } from "@/backend/modules/shared/bullmq/connections/redis";

// Workflow queue - for scheduling/kicking off executions
export const workflowQueue = new Queue("workflow_queue", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

// Node queue - for processing individual node runs
export const nodeQueue = new Queue("node_queue", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

// Queue events for monitoring
export const workflowQueueEvents = new QueueEvents("workflow_queue", {
  connection: redisConnection,
});

export const nodeQueueEvents = new QueueEvents("node_queue", {
  connection: redisConnection,
});

// Helper to add workflow job
export async function addWorkflowJob(
  name: string,
  data: {
    workflowId: string;
    executionId?: string;
    stateIn?: Record<string, unknown>;
  },
  options?: { delay?: number; repeat?: { cron: string; tz?: string } }
) {
  return workflowQueue.add(name, data, options);
}

// Helper to add node job
export async function addNodeJob(
  name: string,
  data: {
    executionId: string;
    workflowId: string;
    nodeId: string;
  }
) {
  return nodeQueue.add(name, data);
}
