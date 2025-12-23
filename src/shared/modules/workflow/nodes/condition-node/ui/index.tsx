import { memo } from "react";
import { Position, type NodeProps, Handle } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { NodeWrapper } from "../../node-wrapper"; // Adjust path if needed
import { WorkflowNode } from "../../../types/Workflow";

export const ConditionNodeComponent = memo(
  ({ id, data, selected }: NodeProps<WorkflowNode>) => {
    const config = data as { expression?: string } | undefined;
    const truncatedExpr =
      config?.expression && config.expression.length > 25
        ? config.expression.substring(0, 25) + "..."
        : config?.expression;

    return (
      <NodeWrapper
        id={id}
        data={data}
        selected={selected}
        title="Condition"
        icon={GitBranch}
        handles={{ source: [], target: [Position.Left] }}
        className="border-purple-500/50"
        onEdit={() =>
          document.dispatchEvent(
            new CustomEvent("open-node-properties", {
              detail: { id, type: "condition" },
            })
          )
        }
      >
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs text-muted-foreground truncate max-w-[180px]">
            {truncatedExpr || "No condition set"}
          </p>

          <div className="flex flex-col gap-2 mt-1">
            {/* True Output */}
            <div className="relative flex items-center justify-end">
              <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mr-2">
                True
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id="true-condition"
                className="bg-green-500"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              />
            </div>

            {/* False Output */}
            <div className="relative flex items-center justify-end">
              <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mr-2">
                False
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id="false-condition"
                className="bg-red-500"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>
        </div>
      </NodeWrapper>
    );
  }
);

ConditionNodeComponent.displayName = "ConditionNodeComponent";
