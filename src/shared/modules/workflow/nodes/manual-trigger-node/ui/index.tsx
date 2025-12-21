import { Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { Zap } from "lucide-react";
import { WorkflowNode } from "../../../types/Workflow";

export const ManualTriggerNode = ({
  id,
  data,
  selected,
}: NodeProps<WorkflowNode>) => {
  return (
    <NodeWrapper
      id={id}
      data={data}
      selected={selected}
      title="Manual Trigger"
      icon={Zap}
      handles={{ source: [Position.Right], target: [] }}
      className="border-yellow-500/50"
      onEdit={() =>
        document.dispatchEvent(
          new CustomEvent("open-node-properties", {
            detail: { id, type: "trigger" },
          })
        )
      }
    >
      <p>Flow starts here</p>
    </NodeWrapper>
  );
};
