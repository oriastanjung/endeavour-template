"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export interface NodeFormProps {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
}

export const OutputForm: React.FC<NodeFormProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Output Key</Label>
        <Input
          value={(data.outputKey as string) || "result"}
          onChange={(e) => updateData("outputKey", e.target.value)}
          placeholder="result"
        />
        <p className="text-xs text-muted-foreground">
          Key name for storing the final output in execution state.
        </p>
      </div>

      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        <p className="font-semibold mb-1">How it works:</p>
        <p className="mb-2">
          This checks the input of this node (from previous nodes).
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            If <strong>Capture entire state</strong> is checked, it dumps
            everything available at this point into <code>outputKey</code>.
          </li>
          <li>
            Use distinct output nodes to capture specific branches (e.g.,
            success vs failure).
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
    </div>
  );
};

export default OutputForm;
