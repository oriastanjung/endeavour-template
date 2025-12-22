import type { NodeTypes } from "@xyflow/react";
import { ManualTriggerNode } from "../nodes/manual-trigger-node/ui";
import { CronTriggerNode } from "../nodes/cron-trigger-node/ui";
import { ConditionNodeComponent } from "../nodes/condition-node/ui";
import { HttpRequestNode } from "../nodes/http-request-node/ui";
import { OutputNode } from "../nodes/output-node/ui";
import { WebhookTriggerNode } from "../nodes/webhook-trigger-node/ui";
import {
  Copy,
  Clock,
  GitBranch,
  Webhook,
  GitFork,
  ArrowRightLeft,
  Timer,
  PenTool,
  Pencil,
  List,
  Code2,
  Globe,
  FileOutput,
} from "lucide-react";
import { SwitchNodeComponent } from "../nodes/switch-node/ui";
import { MergeNodeComponent } from "../nodes/merge-node/ui";
import { WaitNodeComponent } from "../nodes/wait-node/ui";
import { SetNodeComponent } from "../nodes/set-node/ui";
import { EditFieldsNodeComponent } from "../nodes/edit-fields-node/ui";
import { ItemListsNodeComponent } from "../nodes/item-lists-node/ui";
import { CodeNodeComponent } from "../nodes/code-node/ui";

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
  // New Nodes
  "webhook.trigger": WebhookTriggerNode,
  switch: SwitchNodeComponent,
  merge: MergeNodeComponent,
  wait: WaitNodeComponent,
  set: SetNodeComponent,
  "edit.fields": EditFieldsNodeComponent,
  "item.lists": ItemListsNodeComponent,
  code: CodeNodeComponent,
};

// Node categories for sidebar
export const nodeCategories = [
  {
    name: "Triggers",
    nodes: [
      { type: "manual.trigger", label: "Manual Trigger", icon: "Zap" },
      { type: "cron.trigger", label: "Cron Trigger", icon: "Clock" },
      { type: "webhook.trigger", label: "Webhook", icon: "Webhook" },
    ],
  },
  {
    name: "Logic",
    nodes: [
      { type: "condition", label: "Condition", icon: "GitBranch" },
      { type: "switch", label: "Switch", icon: "GitFork" },
      { type: "merge", label: "Merge", icon: "ArrowRightLeft" },
      { type: "wait", label: "Wait", icon: "Timer" },
    ],
  },
  {
    name: "Data",
    nodes: [
      { type: "set", label: "Set", icon: "PenTool" },
      { type: "edit.fields", label: "Edit Fields", icon: "Pencil" },
      { type: "item.lists", label: "Item Lists", icon: "List" },
      { type: "code", label: "Code", icon: "Code2" },
    ],
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
