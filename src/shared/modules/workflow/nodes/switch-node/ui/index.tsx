import { memo } from "react";
import { Position, type NodeProps, Handle } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { GitFork } from "lucide-react";
import { SwitchNodeData, WorkflowNode } from "../../../types/Workflow";

export const SwitchNodeComponent = memo(
  ({ id, data, selected }: NodeProps<WorkflowNode>) => {
    const switchData = data as SwitchNodeData;
    const conditions = switchData.conditions || [];

    return (
      <NodeWrapper
        id={id}
        data={data}
        selected={selected}
        title="Switch"
        icon={GitFork}
        handles={{ source: [], target: [Position.Left] }} // Custom source handles
        className="border-blue-500/50"
        onEdit={() =>
          document.dispatchEvent(
            new CustomEvent("open-node-properties", {
              detail: { id, type: "switch" },
            })
          )
        }
      >
        <div className="flex flex-col gap-2 mt-2">
          {conditions.map((condition, index) => (
            <div
              key={condition.id || index}
              className="relative flex items-center justify-end"
            >
              <span className="text-xs text-muted-foreground mr-2">
                {condition.label}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={condition.id}
                className="bg-blue-500"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          ))}
          {conditions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No conditions configured
            </p>
          )}
        </div>
      </NodeWrapper>
    );
  }
);

SwitchNodeComponent.displayName = "SwitchNodeComponent";
