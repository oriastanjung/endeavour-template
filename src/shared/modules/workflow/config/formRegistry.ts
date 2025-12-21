// Form registry - maps node types to their form components
// This file allows NodePropertiesSheet to dynamically load the correct form

import type { FC } from "react";
import type { NodeFormProps } from "@/shared/modules/workflow/nodes/manual-trigger-node/ui/form";

// Import all form components
import { ManualTriggerForm } from "@/shared/modules/workflow/nodes/manual-trigger-node/ui/form";
import { CronTriggerForm } from "@/shared/modules/workflow/nodes/cron-trigger-node/ui/form";
import { ConditionForm } from "@/shared/modules/workflow/nodes/condition-node/ui/form";
import { HttpRequestForm } from "@/shared/modules/workflow/nodes/http-request-node/ui/form";
import { OutputForm } from "@/shared/modules/workflow/nodes/output-node/ui/form";

export type { NodeFormProps };

// Registry mapping node type to form component
export const nodeFormRegistry: Record<string, FC<NodeFormProps>> = {
  "manual.trigger": ManualTriggerForm,
  "cron.trigger": CronTriggerForm,
  condition: ConditionForm,
  "http.request": HttpRequestForm,
  output: OutputForm,
};

// Helper to get form component for a node type
export function getNodeForm(nodeType: string): FC<NodeFormProps> | null {
  return nodeFormRegistry[nodeType] || null;
}
