// src/shared/modules/workflow/backend/queue/events.ts
// EventEmitter for real-time execution updates

import { EventEmitter } from "events";
import type { ExecutionEvent } from "../types";

// In-memory event emitter for pub/sub
// For production distributed setup, use Redis Pub/Sub
const ee = new EventEmitter();

// Increase max listeners to avoid warnings
ee.setMaxListeners(100);

/**
 * Publish an execution event
 */
export function publishExecutionEvent(
  executionId: string,
  event: ExecutionEvent
) {
  const channel = `execution:${executionId}`;
  console.log(`[Events] Publishing to ${channel}:`, event.type);
  ee.emit(channel, event);
}

/**
 * Subscribe to execution events
 */
export function subscribeToExecution(
  executionId: string,
  handler: (event: ExecutionEvent) => void
) {
  const channel = `execution:${executionId}`;
  ee.on(channel, handler);
  return () => {
    ee.off(channel, handler);
  };
}

/**
 * Publish a node run update event
 */
export function publishNodeRunUpdate(
  executionId: string,
  nodeRunId: string,
  status: string,
  payload?: unknown
) {
  publishExecutionEvent(executionId, {
    type: "node_run.updated",
    payload: {
      nodeRunId,
      status,
      ...((payload as object) ?? {}),
    },
  });
}

/**
 * Publish execution state update
 */
export function publishStateUpdate(
  executionId: string,
  state: Record<string, unknown>
) {
  publishExecutionEvent(executionId, {
    type: "execution.state.updated",
    payload: state,
  });
}

/**
 * Publish execution completed event
 */
export function publishExecutionCompleted(
  executionId: string,
  status: "SUCCESS" | "FAILED" | "CANCELED",
  error?: unknown
) {
  publishExecutionEvent(executionId, {
    type: "execution.completed",
    payload: { status, error },
  });
}

export { ee };
