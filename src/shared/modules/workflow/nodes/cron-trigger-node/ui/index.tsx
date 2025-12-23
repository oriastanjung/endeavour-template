// src/shared/modules/workflow/nodes/cron-trigger-node/ui/index.tsx
// Cron Trigger Node - UI Component
import { memo } from "react";

import { Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { Clock } from "lucide-react";
import type { WorkflowNode } from "../../../types/Workflow";

export const CronTriggerNode = memo(
  ({ id, data, selected }: NodeProps<WorkflowNode>) => {
    // const config = data.config as { cronExpr?: string } | undefined;

    return (
      <NodeWrapper
        id={id}
        data={data}
        selected={selected}
        title="Cron Trigger"
        icon={Clock}
        iconClassName="text-blue-500"
        handles={{ source: [Position.Right], target: [] }}
        className="border-blue-500/50 w-[95px] p-0 pt-4 rounded-l-[50%]"
        onEdit={() =>
          document.dispatchEvent(
            new CustomEvent("open-node-properties", {
              detail: { id, type: "cron.trigger" },
            })
          )
        }
      />
    );
  }
);

CronTriggerNode.displayName = "CronTriggerNode";
