import { memo } from "react";
import { Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { Zap } from "lucide-react";
import { WorkflowNode } from "../../../types/Workflow";

export const ManualTriggerNode = memo(
  ({ id, data, selected }: NodeProps<WorkflowNode>) => {
    return (
      <NodeWrapper
        id={id}
        data={data}
        selected={selected}
        title="Manual Trigger"
        icon={Zap}
        iconClassName="text-yellow-500"
        handles={{ source: [Position.Right], target: [] }}
        className="border-yellow-500/50 w-[95px] p-0 pt-4 rounded-l-[50%]"
        onEdit={() =>
          document.dispatchEvent(
            new CustomEvent("open-node-properties", {
              detail: { id, type: "trigger" },
            })
          )
        }
      />
    );
  }
);

ManualTriggerNode.displayName = "ManualTriggerNode";
