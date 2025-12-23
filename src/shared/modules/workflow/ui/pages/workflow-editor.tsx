/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTRPC } from "@/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkflowProvider } from "@/shared/modules/workflow/ui/context/WorkflowContext";
import { Sidebar } from "@/shared/modules/workflow/ui/components/Sidebar";
import { WorkflowCanvas } from "@/shared/modules/workflow/ui/components/WorkflowCanvas";
import { NodePropertiesSheet } from "@/shared/modules/workflow/ui/components/NodePropertiesSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Play,
  Save,
  CheckCircle2,
  Loader2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import type { Node, Edge } from "@xyflow/react";

const DEBOUNCE_DELAY = 5000; // 5 seconds

export function WorkflowEditor() {
  const params = useParams();
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const workflowId = params.id as string;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<{
    nodes: Node[];
    edges: Edge[];
  } | null>(null);

  // Fetch workflow
  const {
    data: workflow,
    isLoading,
    error,
  } = useQuery(trpc.workflow.get.queryOptions({ id: workflowId }));

  // Update mutation
  const updateMutation = useMutation(
    trpc.workflow.update.mutationOptions({
      onSuccess: () => {
        setIsSaving(false);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.get.queryKey({ id: workflowId }),
        });
      },
      onError: (error) => {
        setIsSaving(false);
        toast.error(error.message || "Failed to save workflow");
      },
    })
  );

  // Helper to extract config from node data
  const extractConfig = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { label, description, executionStatus, ...config } = data || {};
    return config;
  };

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (pendingChangesRef.current) {
        setIsSaving(true);
        const { nodes, edges } = pendingChangesRef.current;
        updateMutation.mutate({
          id: workflowId,
          nodes: nodes.map((n) => ({
            id: n.id,
            type: n.type || "default",
            label: (n.data as { label?: string })?.label,
            positionX: n.position.x,
            positionY: n.position.y,
            config: extractConfig(n.data),
          })),
          edges: edges.map((e) => ({
            id: e.id,
            sourceNodeId: e.source,
            targetNodeId: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            label: e.label as string | undefined,
          })),
        });
        pendingChangesRef.current = null;
      }
    }, DEBOUNCE_DELAY);
  }, [workflowId, updateMutation]);

  // Handle changes from the canvas
  const handleChanges = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      pendingChangesRef.current = { nodes, edges };
      setHasUnsavedChanges(true);
      debouncedSave();
    },
    [debouncedSave]
  );

  // Manual save
  const handleManualSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (pendingChangesRef.current) {
      setIsSaving(true);
      const { nodes, edges } = pendingChangesRef.current;
      updateMutation.mutate({
        id: workflowId,
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type || "default",
          label: (n.data as { label?: string })?.label,
          positionX: n.position.x,
          positionY: n.position.y,
          config: extractConfig(n.data),
        })),
        edges: edges.map((e) => ({
          id: e.id,
          sourceNodeId: e.source,
          targetNodeId: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          label: e.label as string | undefined,
        })),
      });
      pendingChangesRef.current = null;
    }
  }, [workflowId, updateMutation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Memoize initial nodes/edges with explicit types to avoid deep type instantiation
  const workflowNodes = useMemo((): Node[] => {
    if (!workflow) return [];
    return workflow.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { x: n.positionX, y: n.positionY },
      data: {
        label: n.label || n.type,
        ...((n.config as Record<string, unknown>) || {}),
      },
    })) as Node[];
  }, [workflow]);

  const workflowEdges = useMemo((): Edge[] => {
    if (!workflow) return [];
    return workflow.edges.map((e) => ({
      id: e.id,
      source: e.sourceNodeId,
      target: e.targetNodeId,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      label: e.label || undefined,
    })) as Edge[];
  }, [workflow]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Workflow not found</h2>
          <p className="text-muted-foreground mb-4">
            The workflow you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Button onClick={() => router.push("/workflow")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
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
          <div>
            <Input
              value={workflow.name}
              className="h-8 font-medium border-none shadow-none focus-visible:ring-0 p-0 text-lg"
              readOnly
            />
          </div>
          <Badge variant={workflow.isActive ? "default" : "secondary"}>
            {workflow.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Clock className="h-4 w-4" />
                <span>Unsaved changes</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Saved</span>
              </>
            ) : null}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={!hasUnsavedChanges || isSaving}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>

          <Button
            size="sm"
            onClick={() => router.push(`/workflow/preview/${workflowId}`)}
          >
            <Play className="h-4 w-4 mr-1" />
            Preview & Run
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 overflow-hidden">
        <WorkflowProvider
          initialNodes={workflowNodes}
          initialEdges={workflowEdges}
          onChanges={handleChanges}
        >
          <div className="flex-1 h-full relative">
            <WorkflowCanvas />
            <NodePropertiesSheet />
            {/* Sidebar as floating button */}
            <div className="absolute top-4 left-4 z-10">
              <Sidebar />
            </div>
          </div>
        </WorkflowProvider>
      </div>
    </div>
  );
}

export default WorkflowEditor;
