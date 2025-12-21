"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MentionTextarea } from "../../../ui/components/mention-textarea";
import type { WorkflowNode } from "../../../types/Workflow";

export interface NodeFormProps {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
  nodes: WorkflowNode[];
}

export const OutputForm: React.FC<NodeFormProps> = ({
  data,
  updateData,
  nodes,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Output Key</Label>
        <MentionTextarea
          value={(data.outputKey as string) || "result"}
          onChangeValue={(val) => updateData("outputKey", val)}
          nodes={nodes}
          placeholder="result"
          className="min-h-[40px]"
        />
        <p className="text-xs text-muted-foreground">
          Key name for storing the final output in execution state.
        </p>
      </div>

      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        <p className="font-semibold mb-1">How it works:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            If <strong>Capture entire state</strong> is checked, it dumps
            everything available at this point into <code>outputKey</code>.
          </li>
          <li>
            Uncheck to specify exactly what value to capture (e.g.{" "}
            <code>{"{{nodes.http.output}}"}</code>).
          </li>
        </ul>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="captureAll"
          checked={(data.captureAll as boolean) ?? true}
          onCheckedChange={(checked) => updateData("captureAll", checked)}
        />
        <Label htmlFor="captureAll" className="text-sm font-normal">
          Capture entire state (not just specific keys)
        </Label>
      </div>

      {data.captureAll === false && (
        <div className="space-y-2 pt-2 border-t">
          <Label>Output Value</Label>
          <MentionTextarea
            value={(data.outputValue as string) || ""}
            onChangeValue={(val) => updateData("outputValue", val)}
            nodes={nodes}
            placeholder="{{nodes.previousNode.output}}"
            className="min-h-[40px]"
          />
          <p className="text-xs text-muted-foreground">
            Expression to evaluate and store in{" "}
            <code>{(data.outputKey as string) || "result"}</code>.
          </p>
        </div>
      )}
    </div>
  );
};

export default OutputForm;
