// src/shared/modules/workflow/nodes/output-node/ui/index.tsx
// Output Node - UI Component

import { memo } from "react";
import { Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { FileOutput } from "lucide-react";
import type { WorkflowNode } from "../../../types/Workflow";

export const OutputNode = memo(
  ({ id, data, selected }: NodeProps<WorkflowNode>) => {
    console.log("output node", data);
    const config = data as { outputKey?: string } | undefined;
    const key = config?.outputKey ?? "result";

    return (
      <NodeWrapper
        id={id}
        data={data}
        selected={selected}
        title="Output"
        icon={FileOutput}
        iconClassName="text-orange-500"
        handles={{
          source: [],
          target: [Position.Left],
        }}
        className="border-orange-500/50 w-[95px] p-0 pt-4 rounded-r-[50%]"
        onEdit={() =>
          document.dispatchEvent(
            new CustomEvent("open-node-properties", {
              detail: { id, type: "output" },
            })
          )
        }
      >
        <p className="text-xs text-muted-foreground">
          Key:{" "}
          <span className="font-mono text-orange-400 line-clamp-1 text-ellipsis truncate">
            {key}
          </span>
        </p>
      </NodeWrapper>
    );
  }
);

OutputNode.displayName = "OutputNode";
