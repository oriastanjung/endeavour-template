import { memo } from "react";
import { Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { Code2 } from "lucide-react";
import { WorkflowNode } from "../../../types/Workflow";

export const CodeNodeComponent = memo(
  ({ id, data, selected }: NodeProps<WorkflowNode>) => {
    return (
      <NodeWrapper
        id={id}
        data={data}
        selected={selected}
        title="Code"
        icon={Code2}
        handles={{ source: [Position.Right], target: [Position.Left] }}
        className="border-gray-800/50"
        onEdit={() =>
          document.dispatchEvent(
            new CustomEvent("open-node-properties", {
              detail: { id, type: "code" },
            })
          )
        }
      >
        <div className="text-xs text-muted-foreground">Custom JS</div>
      </NodeWrapper>
    );
  }
);

CodeNodeComponent.displayName = "CodeNodeComponent";
