/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from "react";
import { Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { List } from "lucide-react";
import { WorkflowNode } from "../../../types/Workflow";

export const ItemListsNodeComponent = memo(
  ({ id, data, selected }: NodeProps<WorkflowNode>) => {
    const config = data as any;
    const operation = config.operation || "limit";

    return (
      <NodeWrapper
        id={id}
        data={data}
        selected={selected}
        title="Item Lists"
        icon={List}
        handles={{ source: [Position.Right], target: [Position.Left] }}
        className="border-purple-500/50"
        onEdit={() =>
          document.dispatchEvent(
            new CustomEvent("open-node-properties", {
              detail: { id, type: "item.lists" },
            })
          )
        }
      >
        <div className="text-xs text-muted-foreground capitalize">
          Op: {operation}
        </div>
      </NodeWrapper>
    );
  }
);

ItemListsNodeComponent.displayName = "ItemListsNodeComponent";
