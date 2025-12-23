/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from "react";
import { Position, Handle, NodeToolbar, useReactFlow } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { WorkflowNodeData } from "../types/Workflow";

interface NodeWrapperProps {
  id: string; // ReactFlow passes id
  data: WorkflowNodeData;
  selected?: boolean;
  title: string;
  icon?: React.ElementType;
  children?: React.ReactNode;
  handles?: {
    source?: Position[];
    target?: Position[];
  };
  className?: string;
  iconClassName?: string;
  onEdit?: () => void;
}

export const NodeWrapper = memo(
  ({
    id,
    data,
    selected,
    title,
    icon: Icon,
    iconClassName,
    children,
    handles = { source: [], target: [] },
    className,
    onEdit,
  }: NodeWrapperProps) => {
    const { setNodes } = useReactFlow();

    const handleDelete = () => {
      setNodes((nodes) => nodes.filter((n) => n.id !== id));
    };

    const rawStatus = (data as any).executionStatus as string | undefined;
    const status = rawStatus?.toUpperCase();

    let statusBorder = "border-border";
    if (status === "RUNNING")
      statusBorder = "border-blue-500 animate-pulse ring-2 ring-blue-500/50";
    else if (status === "SUCCESS")
      statusBorder = "border-green-500 ring-2 ring-green-500/20";
    else if (status === "FAILED")
      statusBorder = "border-red-500 ring-2 ring-red-500/20";
    else if (selected) statusBorder = "border-primary ring-1 ring-primary";

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
            onClick={onEdit}
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

        <div className="w-full flex flex-col items-center justify-center gap-2">
          <Card
            className={cn(
              "w-[250px] shadow-sm border-2 transition-all duration-300 bg-card",
              statusBorder,
              className
            )}
          >
            {handles.target?.map((position, index) => (
              <Handle
                key={`target-${index}`}
                type="target"
                position={position}
                className="w-5 h-5 bg-muted-foreground border-2 border-background"
              />
            ))}

            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-center gap-2 space-y-0">
              {Icon && (
                <Icon
                  className={cn("w-6 h-6 text-muted-foreground", iconClassName)}
                />
              )}
            </CardHeader>

            <CardContent className="p-0 px-3 pt-0 text-xs text-muted-foreground relative">
              {data.description && (
                <div className="mb-2">{data.description}</div>
              )}
              {children}

              <div className="absolute -top-3 -right-3 z-50">
                {status === "RUNNING" && (
                  <div className="bg-background rounded-full p-1 shadow-md border animate-in zoom-in spin-in duration-300">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  </div>
                )}
                {status === "SUCCESS" && (
                  <div className="bg-background rounded-full p-1 shadow-md border animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-100" />
                  </div>
                )}
                {status === "FAILED" && (
                  <div className="bg-background rounded-full p-1 shadow-md border animate-in zoom-in duration-300">
                    <XCircle className="w-4 h-4 text-red-500 fill-red-100" />
                  </div>
                )}
              </div>
            </CardContent>

            {handles.source?.map((position, index) => (
              <Handle
                key={`source-${index}`}
                type="source"
                position={position}
                className="w-5 h-5 bg-primary border-2 border-background"
              />
            ))}
          </Card>
          <div className="text-sm font-medium leading-none">{title}</div>
        </div>
      </div>
    );
  }
);

NodeWrapper.displayName = "NodeWrapper";
