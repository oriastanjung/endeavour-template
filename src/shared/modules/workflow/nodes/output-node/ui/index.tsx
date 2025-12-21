// src/shared/modules/workflow/nodes/output-node/ui/index.tsx
// Output Node - UI Component

import { Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { FileOutput } from "lucide-react";
import type { WorkflowNode } from "../../../types/Workflow";

export const OutputNode = ({ id, data, selected }: NodeProps<WorkflowNode>) => {
  const config = data.config as { key?: string } | undefined;
  const key = config?.key ?? "result";

  return (
    <NodeWrapper
      id={id}
      data={data}
      selected={selected}
      title="Output"
      icon={FileOutput}
      handles={{
        source: [],
        target: [Position.Left],
      }}
      className="border-orange-500/50"
      onEdit={() =>
        document.dispatchEvent(
          new CustomEvent("open-node-properties", {
            detail: { id, type: "output" },
          })
        )
      }
    >
      <p className="text-xs text-muted-foreground">
        Key: <span className="font-mono text-orange-400">{key}</span>
      </p>
    </NodeWrapper>
  );
};
