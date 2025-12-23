// src/shared/modules/workflow/nodes/http-request-node/ui/index.tsx
// HTTP Request Node - UI Component
import { memo } from "react";
import { Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { Globe } from "lucide-react";
import type { WorkflowNode } from "../../../types/Workflow";

export const HttpRequestNode = memo(
  ({ id, data, selected }: NodeProps<WorkflowNode>) => {
    const config = data as { method?: string; url?: string } | undefined;
    const method = config?.method ?? "GET";
    const url = config?.url ?? "";
    const truncatedUrl = url.length > 25 ? url.substring(0, 25) + "..." : url;

    return (
      <NodeWrapper
        id={id}
        data={data}
        selected={selected}
        title="HTTP Request"
        icon={Globe}
        iconClassName="text-green-500"
        handles={{
          source: [Position.Right],
          target: [Position.Left],
        }}
        className="border-green-500/50"
        onEdit={() =>
          document.dispatchEvent(
            new CustomEvent("open-node-properties", {
              detail: { id, type: "http.request" },
            })
          )
        }
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-green-400">{method}</span>
          <p className="text-xs text-muted-foreground font-mono">
            {truncatedUrl || "No URL set"}
          </p>
        </div>
      </NodeWrapper>
    );
  }
);

HttpRequestNode.displayName = "HttpRequestNode";
