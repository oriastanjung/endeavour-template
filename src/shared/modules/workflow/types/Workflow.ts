import type { Node, Edge } from "@xyflow/react";

export type WorkflowNodeType =
  | "manual.trigger"
  | "cron.trigger"
  | "webhook.trigger"
  | "condition"
  | "switch"
  | "merge"
  | "wait"
  | "http.request"
  | "set"
  | "edit.fields"
  | "item.lists"
  | "code"
  | "output";

export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  executionStatus?: "running" | "completed" | "failed";
}

export interface MessageNodeData extends BaseNodeData {
  message: string;
}

export interface ConditionNodeData extends BaseNodeData {
  condition: string;
}

export interface SwitchNodeData extends BaseNodeData {
  conditions: { id: string; label: string; expression: string }[];
}

export interface WaitNodeData extends BaseNodeData {
  duration: number;
  unit: "seconds" | "minutes" | "hours";
}

export interface SetNodeData extends BaseNodeData {
  values: { key: string; value: string }[];
}

export interface ApiRequestNodeData extends BaseNodeData {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
}

export interface AIProcessNodeData extends BaseNodeData {
  prompt: string;
  outputType: "text" | "json";
  schema?: Record<string, string>; // key: type (e.g., 'name': 'string')
}

export interface CodeNodeData extends BaseNodeData {
  code: string;
}

export interface EditFieldsNodeData extends BaseNodeData {
  mode: "append" | "keep_only";
  fields: { key: string; value: string }[];
}

export interface ItemListsNodeData extends BaseNodeData {
  operation: "limit" | "sort";
  field: string;
  limit?: number;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
}

export type WorkflowNodeData =
  | BaseNodeData
  | MessageNodeData
  | ConditionNodeData
  | SwitchNodeData
  | WaitNodeData
  | SetNodeData
  | ApiRequestNodeData
  | AIProcessNodeData
  | CodeNodeData
  | EditFieldsNodeData
  | ItemListsNodeData;

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;
export type WorkflowEdge = Edge;

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
