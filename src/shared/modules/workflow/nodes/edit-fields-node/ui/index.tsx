/* eslint-disable @typescript-eslint/no-explicit-any */
import { Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";
import { NodeWrapper } from "../../node-wrapper";
import { Pencil } from "lucide-react";
import { WorkflowNode } from "../../../types/Workflow";

export const EditFieldsNodeComponent = memo(
  ({ id, data, selected }: NodeProps<WorkflowNode>) => {
    // casting to any as specific type definition is similar to Set but config is different
    const config = data as any;
    const fields = config.fields || [];
    const mode = config.mode || "append";

    return (
      <NodeWrapper
        id={id}
        data={data}
        selected={selected}
        title="Edit Fields"
        icon={Pencil}
        handles={{ source: [Position.Right], target: [Position.Left] }}
        className="border-blue-400/50"
        onEdit={() =>
          document.dispatchEvent(
            new CustomEvent("open-node-properties", {
              detail: { id, type: "edit.fields" },
            })
          )
        }
      >
        <div className="flex flex-col gap-1">
          <div className="text-[10px] uppercase font-bold text-muted-foreground">
            {mode === "keep_only" ? "Keep Only" : "Append"}
          </div>
          {fields.slice(0, 3).map((v: any, i: number) => (
            <div key={i} className="text-xs text-muted-foreground truncate">
              {v.key}: {v.value}
            </div>
          ))}
          {fields.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{fields.length - 3} more
            </div>
          )}
        </div>
      </NodeWrapper>
    );
  }
);

EditFieldsNodeComponent.displayName = "EditFieldsNodeComponent";
