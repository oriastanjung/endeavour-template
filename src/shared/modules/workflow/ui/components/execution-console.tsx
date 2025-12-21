// src/shared/modules/workflow/ui/components/execution-console.tsx
// Real-time execution status panel

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";

type NodeRunStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "SKIPPED"
  | "CANCELED";

type NodeRun = {
  id: string;
  nodeId: string;
  status: NodeRunStatus;
  startedAt?: string | null;
  finishedAt?: string | null;
  output?: unknown;
  error?: unknown;
  node?: {
    type: string;
    label?: string | null;
  };
};

type ExecutionData = {
  id: string;
  status: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  nodeRuns: NodeRun[];
};

type ExecutionConsoleProps = {
  execution: ExecutionData | null;
  isLoading?: boolean;
};

const statusConfig: Record<
  NodeRunStatus,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  PENDING: {
    icon: Clock,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
  },
  RUNNING: {
    icon: Loader2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  SUCCESS: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  FAILED: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  SKIPPED: {
    icon: AlertCircle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  CANCELED: {
    icon: XCircle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
};

function StatusBadge({ status }: { status: NodeRunStatus }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.color} ${config.bgColor} border-0 gap-1`}
    >
      <Icon
        className={`h-3 w-3 ${status === "RUNNING" ? "animate-spin" : ""}`}
      />
      {status}
    </Badge>
  );
}

function NodeRunItem({ nodeRun }: { nodeRun: NodeRun }) {
  const [expanded, setExpanded] = useState(false);
  const nodeLabel = nodeRun.node?.label || nodeRun.node?.type || nodeRun.nodeId;

  return (
    <div
      className="border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{nodeLabel}</span>
        <StatusBadge status={nodeRun.status} />
      </div>

      {expanded && (
        <div className="text-xs space-y-1 pt-2 border-t">
          <div className="text-muted-foreground">
            Node ID: <span className="font-mono">{nodeRun.nodeId}</span>
          </div>
          {nodeRun.startedAt && (
            <div className="text-muted-foreground">
              Started: {new Date(nodeRun.startedAt).toLocaleTimeString()}
            </div>
          )}
          {nodeRun.finishedAt && (
            <div className="text-muted-foreground">
              Finished: {new Date(nodeRun.finishedAt).toLocaleTimeString()}
            </div>
          )}
          {nodeRun.output !== undefined && nodeRun.output !== null && (
            <div className="mt-2">
              <span className="text-muted-foreground">Output:</span>
              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(nodeRun.output as object, null, 2)}
              </pre>
            </div>
          )}
          {nodeRun.error !== undefined && nodeRun.error !== null && (
            <div className="mt-2">
              <span className="text-red-500">Error:</span>
              <pre className="mt-1 p-2 bg-red-500/10 rounded text-xs overflow-auto max-h-32 text-red-500">
                {JSON.stringify(nodeRun.error as object, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ExecutionConsole({
  execution,
  isLoading,
}: ExecutionConsoleProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Execution Console</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!execution) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Execution Console</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No execution selected. Click &quot;Run&quot; to start a workflow.
          </p>
        </CardContent>
      </Card>
    );
  }

  const overallStatus = execution.status as NodeRunStatus;
  const sortedRuns = [...execution.nodeRuns].sort((a, b) => {
    const aTime = a.startedAt ? new Date(a.startedAt).getTime() : 0;
    const bTime = b.startedAt ? new Date(b.startedAt).getTime() : 0;
    return aTime - bTime;
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Execution Console</CardTitle>
          <StatusBadge status={overallStatus} />
        </div>
        {execution.startedAt && (
          <p className="text-xs text-muted-foreground">
            Started: {new Date(execution.startedAt).toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-2">
            {sortedRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Waiting for nodes to execute...
              </p>
            ) : (
              sortedRuns.map((nodeRun) => (
                <NodeRunItem key={nodeRun.id} nodeRun={nodeRun} />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
