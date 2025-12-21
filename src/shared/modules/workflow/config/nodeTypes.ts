import type { NodeTypes } from "@xyflow/react";
import { ManualTriggerNode } from "../nodes/manual-trigger-node/ui";
import { CronTriggerNode } from "../nodes/cron-trigger-node/ui";
import { ConditionNodeComponent } from "../nodes/condition-node/ui";
import { HttpRequestNode } from "../nodes/http-request-node/ui";
import { OutputNode } from "../nodes/output-node/ui";

// Node types for React Flow
export const nodeTypes: NodeTypes = {
  // Trigger nodes
  "manual.trigger": ManualTriggerNode,
  "cron.trigger": CronTriggerNode,
  // Logic nodes
  condition: ConditionNodeComponent,
  // Action nodes
  "http.request": HttpRequestNode,
  // Output nodes
  output: OutputNode,
};

// Node categories for sidebar
export const nodeCategories = [
  {
    name: "Triggers",
    nodes: [
      { type: "manual.trigger", label: "Manual Trigger", icon: "Zap" },
      { type: "cron.trigger", label: "Cron Trigger", icon: "Clock" },
    ],
  },
  {
    name: "Logic",
    nodes: [{ type: "condition", label: "Condition", icon: "GitBranch" }],
  },
  {
    name: "Actions",
    nodes: [{ type: "http.request", label: "HTTP Request", icon: "Globe" }],
  },
  {
    name: "Outputs",
    nodes: [{ type: "output", label: "Output", icon: "FileOutput" }],
  },
];
