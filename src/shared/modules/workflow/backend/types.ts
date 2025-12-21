// src/shared/modules/workflow/backend/types.ts
// Shared types for workflow execution engine

export type NodeType =
  | "manual.trigger"
  | "cron.trigger"
  | "conditional"
  | "http.request"
  | "output";

export type NodeActionContext = {
  executionId: string;
  workflowId: string;
  nodeId: string;
  runId: string;
  // Accumulated state from prior nodes:
  state: Record<string, unknown>;
  // Helper to render Handlebars templates with safe context:
  render: (template: string, scope?: Record<string, unknown>) => string;
  // Emit logs (simplified - no WorkflowLog table per user request)
  log: (
    level: "debug" | "info" | "warn" | "error",
    message: string,
    data?: unknown
  ) => Promise<void>;
  // Persist partial state
  saveState: (patch: Record<string, unknown>) => Promise<void>;
};

export type NodeActionResult = {
  output?: unknown;
  nextEdgeLabel?: string;
};

export type NodeAction = (
  input: unknown,
  ctx: NodeActionContext
) => Promise<NodeActionResult>;

export type NodeRegistryEntry = {
  type: NodeType;
  action: NodeAction;
  // zod schema for config
  configSchema: unknown;
  label: string;
};

// Event types for real-time updates
export type ExecutionEventType =
  | "node_run.updated"
  | "execution.state.updated"
  | "execution.completed";

export type ExecutionEvent = {
  type: ExecutionEventType;
  payload: unknown;
};

// Job data types for BullMQ
export type WorkflowJobData = {
  workflowId: string;
  executionId?: string;
  stateIn?: Record<string, unknown>;
};

export type NodeJobData = {
  executionId: string;
  workflowId: string;
  nodeId: string;
};
