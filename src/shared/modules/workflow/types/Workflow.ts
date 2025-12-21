import type { Node, Edge } from "@xyflow/react";

export type WorkflowNodeType =
  | "manual.trigger"
  | "cron.trigger"
  | "condition"
  | "http.request"
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

export type WorkflowNodeData =
  | BaseNodeData
  | MessageNodeData
  | ConditionNodeData
  | ApiRequestNodeData
  | AIProcessNodeData;

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;
export type WorkflowEdge = Edge;

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
