import { Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { memo } from "react";
import { ArrowRightLeft } from "lucide-react";
import { WorkflowNode } from "../../../types/Workflow";

export const MergeNodeComponent = memo(
  ({ id, data, selected }: NodeProps<WorkflowNode>) => {
    return (
      <NodeWrapper
        id={id}
        data={data}
        selected={selected}
        title="Merge"
        icon={ArrowRightLeft}
        handles={{ source: [Position.Right], target: [Position.Left] }}
        className="border-gray-500/50"
        onEdit={() =>
          document.dispatchEvent(
            new CustomEvent("open-node-properties", {
              detail: { id, type: "merge" },
            })
          )
        }
      >
        <p className="text-xs text-muted-foreground text-center">
          Merges execution paths
        </p>
      </NodeWrapper>
    );
  }
);

MergeNodeComponent.displayName = "MergeNodeComponent";
