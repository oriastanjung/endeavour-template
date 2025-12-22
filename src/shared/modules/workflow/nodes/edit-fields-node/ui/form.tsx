/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash } from "lucide-react";
import { WorkflowNode } from "../../../types/Workflow";
import { MentionTextarea } from "../../../ui/components/mention-textarea";

export const EditFieldsForm = ({
  data,
  updateData,
  nodes,
}: {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
  nodes: WorkflowNode[];
}) => {
  const fields = (data.fields as any[]) || [];
  const mode = (data.mode as string) || "append";

  const addField = () => {
    updateData("fields", [...fields, { key: "", value: "" }]);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    updateData("fields", newFields);
  };

  const updateField = (index: number, key: string, val: string) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: val };
    updateData("fields", newFields);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Mode</Label>
        <Select value={mode} onValueChange={(val) => updateData("mode", val)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="append">Append / Overwrite (Merge)</SelectItem>
            <SelectItem value="keep_only">Keep Only (Filter)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Label>Fields</Label>
        <Button size="sm" variant="outline" onClick={addField} type="button">
          <Plus className="w-4 h-4 mr-1" /> Add Field
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((item, index) => (
          <div
            key={index}
            className="flex gap-2 items-start border p-2 rounded-md bg-muted/10"
          >
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Key</Label>
              <Input
                value={item.key}
                onChange={(e) => updateField(index, "key", e.target.value)}
                placeholder="field_name"
                className="h-8"
              />
            </div>
            <div className="flex-2 space-y-1">
              <Label className="text-xs">Value (Handlebars)</Label>
              <MentionTextarea
                value={item.value}
                onChangeValue={(val) => updateField(index, "value", val)}
                nodes={nodes}
                placeholder="value or {{ state.key }}"
                className="min-h-[38px] text-xs py-1"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeField(index)}
              type="button"
              className="mt-6 h-8 w-8 text-destructive"
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No fields configured
          </p>
        )}
      </div>

      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        <p className="font-semibold mb-1">Examples:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            Map field:{" "}
            <code className="bg-background px-1 rounded">
              Key: new_id, Value: {"{{ nodes.step1.output.id }}"}
            </code>
          </li>
          <li>
            Transform:{" "}
            <code className="bg-background px-1 rounded">
              Key: status, Value: {"{{#if state.error}}failed{{else}}ok{{/if}}"}
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
};
