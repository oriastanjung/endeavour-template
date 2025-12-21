"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface NodeFormProps {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
}

export const ManualTriggerForm: React.FC<NodeFormProps> = ({
  data,
  updateData,
}) => {
  return (
    <div className="space-y-2">
      <Label>Initial Payload (JSON)</Label>
      <Textarea
        value={JSON.stringify(data.payload || {}, null, 2)}
        onChange={(e) => {
          try {
            updateData("payload", JSON.parse(e.target.value));
          } catch {
            // Invalid JSON, don't update
          }
        }}
        placeholder='{ "key": "value" }'
        rows={4}
      />
      <p className="text-xs text-muted-foreground">
        Optional initial data to pass when triggering manually.
      </p>
    </div>
  );
};

export default ManualTriggerForm;
