/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import "@xyflow/react/dist/style.css";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { WorkflowNode } from "../../types/Workflow";
import { useWorkflowContext } from "../context/WorkflowContext";

// Import form components directly
import { ManualTriggerForm } from "../../nodes/manual-trigger-node/ui/form";
import { CronTriggerForm } from "../../nodes/cron-trigger-node/ui/form";
import { ConditionForm } from "../../nodes/condition-node/ui/form";
import { HttpRequestForm } from "../../nodes/http-request-node/ui/form";
import { OutputForm } from "../../nodes/output-node/ui/form";

export const NodePropertiesSheet = () => {
  const { nodes: contextNodes, setNodes } = useWorkflowContext();
  const [currentNode, setCurrentNode] = useState<WorkflowNode | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Listen for custom event from NodeWrapper
  useEffect(() => {
    const handleOpenProperties = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string; type: string }>;

      const node = contextNodes.find((n) => n.id === customEvent.detail.id);

      if (node) {
        setCurrentNode(node);
        setIsOpen(true);
      }
    };

    document.addEventListener("open-node-properties", handleOpenProperties);
    return () => {
      document.removeEventListener(
        "open-node-properties",
        handleOpenProperties
      );
    };
  }, [contextNodes]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNode) return;

    setNodes((nodes) =>
      nodes.map((n) => (n.id === currentNode!.id ? currentNode : n))
    );
    setIsOpen(false);
  };

  const updateData = (key: string, value: any) => {
    if (!currentNode) return;
    setCurrentNode({
      ...currentNode,
      data: {
        ...currentNode.data,
        [key]: value,
      },
    });
  };

  if (!currentNode) return null;

  // Render form based on node type
  const renderNodeForm = () => {
    const data = currentNode.data as Record<string, unknown>;

    switch (currentNode.type) {
      case "manual.trigger":
        return (
          <ManualTriggerForm
            data={data}
            updateData={updateData}
            nodes={contextNodes}
          />
        );
      case "cron.trigger":
        return (
          <CronTriggerForm
            data={data}
            updateData={updateData}
            nodes={contextNodes}
          />
        );
      case "condition":
        return (
          <ConditionForm
            data={data}
            updateData={updateData}
            nodes={contextNodes}
          />
        );
      case "http.request":
        return (
          <HttpRequestForm
            data={data}
            updateData={updateData}
            nodes={contextNodes}
          />
        );
      case "output":
        return (
          <OutputForm
            data={data}
            updateData={updateData}
            nodes={contextNodes}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit {currentNode.data.label}</SheetTitle>
          <SheetDescription>
            Configure properties for {currentNode.type}.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSave} className="space-y-6 py-6 px-4">
          {/* Common: Label field */}
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={currentNode.data.label || ""}
              onChange={(e) => updateData("label", e.target.value)}
            />
          </div>

          {/* Dynamic form based on node type */}
          {renderNodeForm()}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
