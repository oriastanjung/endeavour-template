"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MentionTextarea } from "../../../ui/components/mention-textarea";
import type { WorkflowNode } from "../../../types/Workflow";

export interface NodeFormProps {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
  nodes: WorkflowNode[];
}

export const HttpRequestForm: React.FC<NodeFormProps> = ({
  data,
  updateData,
  nodes,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Method</Label>
        <Select
          value={(data.method as string) || "GET"}
          onValueChange={(val) => updateData("method", val)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>URL</Label>
        <MentionTextarea
          value={(data.url as string) || ""}
          onChangeValue={(val) => updateData("url", val)}
          nodes={nodes}
          placeholder="https://api.example.com/v1/{{userId}}"
          className="min-h-[40px]"
        />
        <p className="text-xs text-muted-foreground">
          Supports Handlebars templates: {"{{variable}}"}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Headers (JSON)</Label>
        <MentionTextarea
          value={
            typeof data.headers === "object"
              ? JSON.stringify(data.headers, null, 2)
              : (data.headers as string) || ""
          }
          onChangeValue={(val) => {
            try {
              updateData("headers", JSON.parse(val));
            } catch {
              updateData("headers", val);
            }
          }}
          nodes={nodes}
          placeholder='{ "Authorization": "Bearer {{token}}" }'
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Body (JSON)</Label>
        <MentionTextarea
          value={(data.body as string) || ""}
          onChangeValue={(val) => updateData("body", val)}
          nodes={nodes}
          placeholder='{ "name": "{{name}}", "email": "{{email}}" }'
          className="min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          Request body for POST/PUT/PATCH methods.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Timeout (ms)</Label>
        <Input
          type="number"
          value={(data.timeout as number) || 30000}
          onChange={(e) => updateData("timeout", parseInt(e.target.value))}
          placeholder="30000"
        />
      </div>
    </div>
  );
};

export default HttpRequestForm;
