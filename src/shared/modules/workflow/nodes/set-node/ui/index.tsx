import { memo } from "react";
import { Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { PenTool } from "lucide-react";
import { SetNodeData, WorkflowNode } from "../../../types/Workflow";

export const SetNodeComponent = memo(
  ({ id, data, selected }: NodeProps<WorkflowNode>) => {
    const setData = data as SetNodeData;
    const values = setData.values || [];

    return (
      <NodeWrapper
        id={id}
        data={data}
        selected={selected}
        title="Set"
        icon={PenTool}
        handles={{ source: [Position.Right], target: [Position.Left] }}
        className="border-indigo-500/50"
        onEdit={() =>
          document.dispatchEvent(
            new CustomEvent("open-node-properties", {
              detail: { id, type: "set" },
            })
          )
        }
      >
        <div className="flex flex-col gap-1">
          {values.slice(0, 3).map((v, i) => (
            <div key={i} className="text-xs text-muted-foreground truncate">
              {v.key}: {v.value}
            </div>
          ))}
          {values.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{values.length - 3} more
            </div>
          )}
        </div>
      </NodeWrapper>
    );
  }
);

SetNodeComponent.displayName = "SetNodeComponent";
