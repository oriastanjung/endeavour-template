"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface NodeFormProps {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
}

export const HttpRequestForm: React.FC<NodeFormProps> = ({
  data,
  updateData,
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
        <Input
          value={(data.url as string) || ""}
          onChange={(e) => updateData("url", e.target.value)}
          placeholder="https://api.example.com/v1/{{userId}}"
        />
        <p className="text-xs text-muted-foreground">
          Supports Handlebars templates: {"{{variable}}"}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Headers (JSON)</Label>
        <Textarea
          value={
            typeof data.headers === "object"
              ? JSON.stringify(data.headers, null, 2)
              : (data.headers as string) || ""
          }
          onChange={(e) => {
            try {
              updateData("headers", JSON.parse(e.target.value));
            } catch {
              updateData("headers", e.target.value);
            }
          }}
          placeholder='{ "Authorization": "Bearer {{token}}" }'
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Body (JSON)</Label>
        <Textarea
          value={(data.body as string) || ""}
          onChange={(e) => updateData("body", e.target.value)}
          placeholder='{ "name": "{{name}}", "email": "{{email}}" }'
          rows={4}
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
