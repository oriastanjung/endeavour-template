"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface NodeFormProps {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
}

export const ConditionForm: React.FC<NodeFormProps> = ({
  data,
  updateData,
}) => {
  return (
    <div className="space-y-2">
      <Label>Condition Expression</Label>
      <Input
        value={(data.expression as string) || ""}
        onChange={(e) => updateData("expression", e.target.value)}
        placeholder="{{value}} === true"
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
              {"{{#if nodes.http-req.output.body.results}}"}
            </code>
          </li>
          <li>
            Check array length:{" "}
            <code className="bg-background px-1 rounded">
              {"{{#if (gt nodes.http-req.output.body.results.length 0)}}"}
            </code>
          </li>
          <li>
            Comparison:{" "}
            <code className="bg-background px-1 rounded">
              {"{{#if (eq nodes.step1.output.status 'active')}}"}
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ConditionForm;
