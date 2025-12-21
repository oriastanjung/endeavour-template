"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { WorkflowNode } from "../../../types/Workflow";

export interface NodeFormProps {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
  nodes: WorkflowNode[];
}

export const CronTriggerForm: React.FC<NodeFormProps> = ({
  data,
  updateData,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Cron Expression</Label>
        <Input
          value={(data.cronExpression as string) || ""}
          onChange={(e) => updateData("cronExpression", e.target.value)}
          placeholder="0 0 * * *"
        />
        <p className="text-xs text-muted-foreground">
          Standard cron format: minute hour day month weekday
        </p>
      </div>

      <div className="space-y-2">
        <Label>Timezone (optional)</Label>
        <Input
          value={(data.timezone as string) || ""}
          onChange={(e) => updateData("timezone", e.target.value)}
          placeholder="Asia/Jakarta"
        />
      </div>
    </div>
  );
};

export default CronTriggerForm;
