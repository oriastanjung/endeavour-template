// src/shared/modules/workflow/config/nodeRegistry.ts
// Node registry mapping node types to their actions and schemas

import { manualTriggerAction } from "../nodes/manual-trigger-node/action";
import { manualTriggerSchema } from "../nodes/manual-trigger-node/sheet";
import { cronTriggerAction } from "../nodes/cron-trigger-node/action";
import { cronTriggerSchema } from "../nodes/cron-trigger-node/sheet";
import { conditionAction } from "../nodes/condition-node/action";
import { conditionSchema } from "../nodes/condition-node/sheet";
import { httpRequestAction } from "../nodes/http-request-node/action";
import { httpRequestSchema } from "../nodes/http-request-node/sheet";
import { outputAction } from "../nodes/output-node/action";
import { outputSchema } from "../nodes/output-node/sheet";
import type { NodeRegistryEntry } from "../backend/types";

export const nodeRegistry: Record<string, NodeRegistryEntry> = {
  "manual.trigger": {
    type: "manual.trigger",
    action: manualTriggerAction,
    configSchema: manualTriggerSchema,
    label: "Manual Trigger",
  },
  "cron.trigger": {
    type: "cron.trigger",
    action: cronTriggerAction,
    configSchema: cronTriggerSchema,
    label: "Cron Trigger",
  },
  condition: {
    type: "condition",
    action: conditionAction,
    configSchema: conditionSchema,
    label: "Condition",
  },
  "http.request": {
    type: "http.request",
    action: httpRequestAction,
    configSchema: httpRequestSchema,
    label: "HTTP Request",
  },
  output: {
    type: "output",
    action: outputAction,
    configSchema: outputSchema,
    label: "Output",
  },
};

// Helper to get registry entry
export function getNodeRegistryEntry(
  type: string
): NodeRegistryEntry | undefined {
  return nodeRegistry[type];
}

// Get all node types
export function getNodeTypes(): string[] {
  return Object.keys(nodeRegistry);
}

// Get all node labels for UI
export function getNodeLabels(): { type: string; label: string }[] {
  return Object.values(nodeRegistry).map((entry) => ({
    type: entry.type,
    label: entry.label,
  }));
}
