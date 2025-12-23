"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTRPC } from "@/trpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ExecutionConsole } from "@/shared/modules/workflow/ui/components/execution-console";
import { nodeTypes } from "@/shared/modules/workflow/config/nodeTypes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Play,
  Edit,
  Loader2,
  History,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type ExecutionStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELED"
  | "TIMED_OUT";

interface Execution {
  id: string;
  status: ExecutionStatus;
  triggerType: string;
  startedAt: Date | null;
  finishedAt: Date | null;
}

function getStatusIcon(status: ExecutionStatus) {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "FAILED":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "RUNNING":
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusBadge(status: ExecutionStatus) {
  switch (status) {
    case "SUCCESS":
      return (
        <Badge variant="default" className="bg-green-500">
          Success
        </Badge>
      );
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>;
    case "RUNNING":
      return <Badge variant="secondary">Running</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}

export function WorkflowPreview() {
  const params = useParams();
  const router = useRouter();
  const trpc = useTRPC();
  const workflowId = params.id as string;

  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(
    null
  );

  // Fetch workflow
  const { data: workflow, isLoading: workflowLoading } = useQuery(
    trpc.workflow.get.queryOptions({ id: workflowId })
  );

  // Fetch executions
  const {
    data: executionsData,
    isLoading: executionsLoading,
    refetch: refetchExecutions,
  } = useQuery(
    trpc.workflow.listExecutions.queryOptions(
      { workflowId, limit: 50 },
      {
        refetchInterval: 1000,
      }
    )
  );

  // Fetch selected execution details
  const { data: selectedExecution } = useQuery({
    ...trpc.workflow.getExecution.queryOptions({
      executionId: selectedExecutionId ?? "",
    }),
    enabled: !!selectedExecutionId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "RUNNING" || data?.status === "PENDING") {
        return 1000;
      }
      return false;
    },
  });

  // Run workflow mutation
  const runMutation = useMutation(
    trpc.workflow.runManual.mutationOptions({
      onSuccess: (execution) => {
        toast.success("Workflow started!");
        setSelectedExecutionId(execution.executionId);
        refetchExecutions();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to run workflow");
      },
    })
  );

  // Convert workflow nodes/edges to ReactFlow format
  const { nodes, edges } = useMemo(() => {
    if (!workflow) return { nodes: [], edges: [] };

    // Create a map of node statuses from the selected execution
    const nodeStatusMap = new Map<string, string>();
    if (selectedExecution?.nodeRuns) {
      selectedExecution.nodeRuns.forEach((run) => {
        nodeStatusMap.set(run.nodeId, run.status.toLowerCase());
      });
    }

    const flowNodes: Node[] = workflow.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: { x: node.positionX, y: node.positionY },
      data: {
        label: node.label || node.type,
        ...((node.config as Record<string, unknown>) || {}),
        executionStatus: nodeStatusMap.get(node.id),
      },
      draggable: false,
      selectable: false,
    }));

    const flowEdges: Edge[] = workflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      label: edge.label || undefined,
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed },
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [workflow, selectedExecution]);

  if (workflowLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Workflow not found</h2>
          <Button onClick={() => router.push("/workflow")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const executions = executionsData?.executions ?? [];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b flex items-center justify-between px-4 bg-background shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/workflow")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">{workflow.name}</h1>
              <Badge variant={workflow.isActive ? "default" : "secondary"}>
                {workflow.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/workflow/detail/${workflowId}`)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              onClick={() => runMutation.mutate({ workflowId })}
              disabled={runMutation.isPending}
            >
              {runMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Run Workflow
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnScroll
            zoomOnScroll
          >
            <Background />
            <Controls showInteractive={false} />
            <MiniMap />
          </ReactFlow>

          {/* Selected Execution Console Overlay */}
          {selectedExecution && (
            <div className="absolute bottom-4 left-4 right-4 h-[40%]">
              <ExecutionConsole execution={selectedExecution} />
            </div>
          )}
        </div>
      </div>

      {/* Execution History Sidebar */}
      <div className="w-80 border-l flex flex-col bg-background">
        <div className="h-14 border-b flex items-center px-4">
          <History className="h-5 w-5 mr-2 text-muted-foreground" />
          <h2 className="font-semibold">Execution History</h2>
        </div>

        <ScrollArea className="flex-1 h-screen">
          {executionsLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : executions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>No executions yet</p>
              <p className="text-sm">Run the workflow to see history here</p>
            </div>
          ) : (
            <div className="p-2">
              {executions.map((execution) => (
                <button
                  key={execution.id}
                  onClick={() => {
                    if (selectedExecutionId === execution.id) {
                      setSelectedExecutionId("");
                    } else {
                      setSelectedExecutionId(execution.id);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors cursor-pointer ${
                    selectedExecutionId === execution.id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      <span className="text-sm font-medium">
                        {execution.triggerType === "manual" ? "Manual" : "Cron"}
                      </span>
                    </div>
                    {getStatusBadge(execution.status)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {execution.startedAt
                      ? formatDistanceToNow(new Date(execution.startedAt), {
                          addSuffix: true,
                        })
                      : "Pending..."}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default WorkflowPreview;
