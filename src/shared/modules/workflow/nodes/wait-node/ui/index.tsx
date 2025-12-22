import { memo } from "react";
import { Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { Timer } from "lucide-react";
import { WaitNodeData, WorkflowNode } from "../../../types/Workflow";

export const WaitNodeComponent = memo(
  ({ id, data, selected }: NodeProps<WorkflowNode>) => {
    const waitData = data as WaitNodeData;

    return (
      <NodeWrapper
        id={id}
        data={data}
        selected={selected}
        title="Wait"
        icon={Timer}
        handles={{ source: [Position.Right], target: [Position.Left] }}
        className="border-orange-500/50"
        onEdit={() =>
          document.dispatchEvent(
            new CustomEvent("open-node-properties", {
              detail: { id, type: "wait" },
            })
          )
        }
      >
        <div className="text-xs text-muted-foreground">
          {waitData.duration ?? 5} {waitData.unit ?? "seconds"}
        </div>
      </NodeWrapper>
    );
  }
);

WaitNodeComponent.displayName = "WaitNodeComponent";
