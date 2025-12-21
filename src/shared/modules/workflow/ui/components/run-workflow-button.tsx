// src/shared/modules/workflow/ui/components/run-workflow-button.tsx
// Button to trigger workflow execution

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";

type RunWorkflowButtonProps = {
  workflowId: string;
  onRun?: (executionId: string) => void;
  disabled?: boolean;
};

export function RunWorkflowButton({
  workflowId,
  onRun,
  disabled,
}: RunWorkflowButtonProps) {
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    if (!workflowId || isRunning) return;

    setIsRunning(true);
    try {
      // For now, we'll use a placeholder - this should be connected to tRPC
      console.log(`Running workflow ${workflowId}`);
      // The actual tRPC call would be:
      // const result = await trpc.workflow.runManual.mutate({ workflowId });
      // onRun?.(result.executionId);

      // Placeholder for demo
      setTimeout(() => {
        const mockExecutionId = `exec-${Date.now()}`;
        onRun?.(mockExecutionId);
        setIsRunning(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to run workflow:", error);
      setIsRunning(false);
    }
  };

  return (
    <Button
      onClick={handleRun}
      disabled={disabled || isRunning || !workflowId}
      size="sm"
      className="gap-2"
    >
      {isRunning ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Running...
        </>
      ) : (
        <>
          <Play className="h-4 w-4" />
          Run Workflow
        </>
      )}
    </Button>
  );
}
