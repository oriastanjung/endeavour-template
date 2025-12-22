import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { WorkflowNode } from "../../../types/Workflow";
import { WebhookTriggerConfig } from "../sheet";

export const WebhookTriggerForm = ({
  data,
  updateData,
}: {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
  nodes: WorkflowNode[];
}) => {
  const config = data as Partial<WebhookTriggerConfig>;
  const method = config.method || "POST";
  const requiredHeaders = config.requiredHeaders || [];
  const requiredPayload = config.requiredPayload || [];

  const addHeader = () => {
    updateData("requiredHeaders", [...requiredHeaders, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    updateData(
      "requiredHeaders",
      requiredHeaders.filter((_, i) => i !== index)
    );
  };

  const updateHeader = (index: number, field: "key" | "value", val: string) => {
    const newHeaders = [...requiredHeaders];
    newHeaders[index] = { ...newHeaders[index], [field]: val };
    updateData("requiredHeaders", newHeaders);
  };

  const addPayload = () => {
    updateData("requiredPayload", [...requiredPayload, { key: "", value: "" }]);
  };

  const removePayload = (index: number) => {
    updateData(
      "requiredPayload",
      requiredPayload.filter((_, i) => i !== index)
    );
  };

  const updatePayload = (
    index: number,
    field: "key" | "value",
    val: string
  ) => {
    const newPayload = [...requiredPayload];
    newPayload[index] = { ...newPayload[index], [field]: val };
    updateData("requiredPayload", newPayload);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 border rounded-md p-3 bg-muted/20">
        <h4 className="text-sm font-medium">Webhook Configuration</h4>
        <div className="space-y-2">
          <Label>HTTP Method</Label>
          <Select
            value={method}
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

        <p className="text-xs text-muted-foreground mt-2">
          Endpoint: <code>POST /api/webhooks/workflow/&#123;id&#125;</code>
          <br />
          <span className="opacity-70">
            (Method validation is enforced by API)
          </span>
        </p>
      </div>

      {/* Auth / Validation Headers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Required Headers (Authentication)</Label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={addHeader}
            className="h-6 w-6"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          e.g. <code>X-API-Key: my-secret</code>
        </p>

        {requiredHeaders.length === 0 && (
          <div className="text-xs text-muted-foreground/50 italic py-2">
            No required headers
          </div>
        )}

        {requiredHeaders.map((header, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              placeholder="Header Key"
              value={header.key}
              onChange={(e) => updateHeader(idx, "key", e.target.value)}
              className="h-8 text-xs font-mono"
            />
            <Input
              placeholder="Start Value"
              value={header.value}
              onChange={(e) => updateHeader(idx, "value", e.target.value)}
              className="h-8 text-xs font-mono"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-destructive"
              onClick={() => removeHeader(idx)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Require Payload Match */}
      {(method === "POST" || method === "PUT" || method === "PATCH") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Required Payload (Match)</Label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={addPayload}
              className="h-6 w-6"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Body JSON properties must match these values
          </p>

          {requiredPayload.length === 0 && (
            <div className="text-xs text-muted-foreground/50 italic py-2">
              No required payload matches
            </div>
          )}

          {requiredPayload.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="JSON Key"
                value={item.key}
                onChange={(e) => updatePayload(idx, "key", e.target.value)}
                className="h-8 text-xs font-mono"
              />
              <Input
                placeholder="Expected Value"
                value={item.value}
                onChange={(e) => updatePayload(idx, "value", e.target.value)}
                className="h-8 text-xs font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-destructive"
                onClick={() => removePayload(idx)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
