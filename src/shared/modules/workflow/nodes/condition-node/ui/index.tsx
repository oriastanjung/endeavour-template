/* eslint-disable @typescript-eslint/no-explicit-any */
// src/shared/modules/workflow/nodes/condition-node/ui/index.tsx
// Condition Node - UI Component with dual output handles (true/false)

import {
  Handle,
  Position,
  type NodeProps,
  useReactFlow,
  NodeToolbar,
} from "@xyflow/react";
import {
  GitBranch,
  Settings,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkflowNode } from "../../../types/Workflow";

export const ConditionNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<WorkflowNode>) => {
  const { setNodes } = useReactFlow();
  const config = data.config as { expression?: string } | undefined;
  const truncatedExpr =
    config?.expression && config.expression.length > 25
      ? config.expression.substring(0, 25) + "..."
      : config?.expression;

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  };

  const handleEdit = () => {
    document.dispatchEvent(
      new CustomEvent("open-node-properties", {
        detail: { id, type: "condition" },
      })
    );
  };

  const rawStatus = (data as any).executionStatus as string | undefined;
  const status = rawStatus?.toUpperCase();

  let statusBorder = "border-purple-500/50";
  if (selected) statusBorder = "border-purple-500 ring-1 ring-purple-500";
  else if (status === "RUNNING")
    statusBorder = "border-blue-500 animate-pulse ring-2 ring-blue-500/50";
  else if (status === "SUCCESS") statusBorder = "border-green-500";
  else if (status === "FAILED") statusBorder = "border-red-500";

  return (
    <div className="relative group">
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        className="flex gap-2 bg-background p-1 border rounded shadow-md z-50"
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleEdit}
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </NodeToolbar>

      <Card
        className={cn(
          "w-[200px] shadow-sm border-2 transition-all duration-300 bg-card",
          statusBorder
        )}
      >
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-muted-foreground border-2 border-background"
        />

        <CardHeader className="p-3 pb-2 flex flex-row items-center gap-2 space-y-0">
          <GitBranch className="w-4 h-4 text-purple-500" />
          <CardTitle className="text-sm font-medium leading-none">
            Condition
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
          <p className="font-mono text-xs">
            {truncatedExpr || "No condition set"}
          </p>

          {/* Output labels */}
          <div className="mt-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">
                True
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">
                False
              </span>
              <div className="w-2 h-2 rounded-full bg-red-500" />
            </div>
          </div>
          {/* Status Icons */}
          <div className="absolute -bottom-3 -right-3 z-50">
            {status === "running" && (
              <div className="bg-background rounded-full p-1 shadow-md border animate-in zoom-in spin-in duration-300">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="bg-background rounded-full p-1 shadow-md border animate-in zoom-in duration-300">
                <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-100" />
              </div>
            )}
            {status === "failed" && (
              <div className="bg-background rounded-full p-1 shadow-md border animate-in zoom-in duration-300">
                <XCircle className="w-5 h-5 text-red-500 fill-red-100" />
              </div>
            )}
          </div>
        </CardContent>

        {/* True output handle (top-right) */}
        <Handle
          type="source"
          position={Position.Right}
          id="true"
          className="w-3 h-3 bg-green-500! border-2 border-background"
          style={{ top: "45%" }}
        />

        {/* False output handle (bottom-right) */}
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          className="w-3 h-3 bg-red-500! border-2 border-background"
          style={{ top: "70%" }}
        />
      </Card>
    </div>
  );
};
