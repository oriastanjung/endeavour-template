// src/shared/modules/workflow/nodes/cron-trigger-node/ui/index.tsx
// Cron Trigger Node - UI Component

import { Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { Clock } from "lucide-react";
import type { WorkflowNode } from "../../../types/Workflow";

export const CronTriggerNode = ({
  id,
  data,
  selected,
}: NodeProps<WorkflowNode>) => {
  const config = data.config as { cronExpr?: string } | undefined;

  return (
    <NodeWrapper
      id={id}
      data={data}
      selected={selected}
      title="Cron Trigger"
      icon={Clock}
      handles={{ source: [Position.Right], target: [] }}
      className="border-blue-500/50"
      onEdit={() =>
        document.dispatchEvent(
          new CustomEvent("open-node-properties", {
            detail: { id, type: "cron.trigger" },
          })
        )
      }
    >
      <p className="text-xs text-muted-foreground">
        {config?.cronExpr || "Schedule not set"}
      </p>
    </NodeWrapper>
  );
};
