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
import { webhookTriggerAction } from "../nodes/webhook-trigger-node/action";
import { webhookTriggerSchema } from "../nodes/webhook-trigger-node/sheet";
import { switchAction } from "../nodes/switch-node/action";
import { switchSchema } from "../nodes/switch-node/sheet";
import { mergeAction } from "../nodes/merge-node/action";
import { mergeSchema } from "../nodes/merge-node/sheet";
import { waitAction } from "../nodes/wait-node/action";
import { waitSchema } from "../nodes/wait-node/sheet";
import { setAction } from "../nodes/set-node/action";
import { setSchema } from "../nodes/set-node/sheet";
import { editFieldsAction } from "../nodes/edit-fields-node/action";
import { editFieldsSchema } from "../nodes/edit-fields-node/sheet";
import { itemListsAction } from "../nodes/item-lists-node/action";
import { itemListsSchema } from "../nodes/item-lists-node/sheet";
import { codeAction } from "../nodes/code-node/action";
import { codeSchema } from "../nodes/code-node/sheet";
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
  "webhook.trigger": {
    type: "webhook.trigger",
    action: webhookTriggerAction,
    configSchema: webhookTriggerSchema,
    label: "Webhook Trigger",
  },
  switch: {
    type: "switch",
    action: switchAction,
    configSchema: switchSchema,
    label: "Switch",
  },
  merge: {
    type: "merge",
    action: mergeAction,
    configSchema: mergeSchema,
    label: "Merge",
  },
  wait: {
    type: "wait",
    action: waitAction,
    configSchema: waitSchema,
    label: "Wait",
  },
  set: {
    type: "set",
    action: setAction,
    configSchema: setSchema,
    label: "Set",
  },
  "edit.fields": {
    type: "edit.fields",
    action: editFieldsAction,
    configSchema: editFieldsSchema,
    label: "Edit Fields",
  },
  "item.lists": {
    type: "item.lists",
    action: itemListsAction,
    configSchema: itemListsSchema,
    label: "Item Lists",
  },
  code: {
    type: "code",
    action: codeAction,
    configSchema: codeSchema,
    label: "Code",
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
