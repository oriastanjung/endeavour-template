"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { MentionTextarea } from "../../../ui/components/mention-textarea";
import type { WorkflowNode } from "../../../types/Workflow";

export interface NodeFormProps {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
  nodes: WorkflowNode[];
}

export const ConditionForm: React.FC<NodeFormProps> = ({
  data,
  updateData,
  nodes,
}) => {
  return (
    <div className="space-y-2">
      <Label>Condition Expression</Label>
      <MentionTextarea
        value={(data.expression as string) || ""}
        onChangeValue={(val) => updateData("expression", val)}
        nodes={nodes}
        placeholder="{{value}} === true"
        className="min-h-[40px]"
      />
      <p className="text-xs text-muted-foreground">
        Handlebars expression that evaluates to true/false.
      </p>

      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        <p className="font-semibold mb-1">Examples:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            Check existence:{" "}
            <code className="bg-background px-1 rounded">
              {"{{#if nodes.http-req.output.body.results}}true{{/if}}"}
            </code>
          </li>
          <li>
            Check array length:{" "}
            <code className="bg-background px-1 rounded">
              {"{{gt nodes.http-req.output.body.results.length 0}}"}
            </code>
          </li>
          <li>
            Comparison:{" "}
            <code className="bg-background px-1 rounded">
              {"{{eq nodes.step1.output.status 'active'}}"}
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ConditionForm;
