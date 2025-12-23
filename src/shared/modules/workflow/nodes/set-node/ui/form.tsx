import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { SetNodeData, WorkflowNode } from "../../../types/Workflow";
import { MentionTextarea } from "../../../ui/components/mention-textarea";

export const SetForm = ({
  data,
  updateData,
  nodes,
}: {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
  nodes: WorkflowNode[];
}) => {
  const setData = data as SetNodeData;
  const values = setData.values || [];

  const addValue = () => {
    updateData("values", [...values, { key: "", value: "" }]);
  };

  const removeValue = (index: number) => {
    const newValues = [...values];
    newValues.splice(index, 1);
    updateData("values", newValues);
  };

  const updateValue = (index: number, field: string, val: string) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], [field]: val };
    updateData("values", newValues);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Values to Set</Label>
        <Button size="sm" variant="outline" onClick={addValue} type="button">
          <Plus className="w-4 h-4 mr-1" /> Add Value
        </Button>
      </div>

      <div className="space-y-3">
        {values.map((item, index) => (
          <div
            key={index}
            className="flex gap-2 items-start border p-2 rounded-md bg-muted/10"
          >
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Key</Label>
              <Input
                value={item.key}
                onChange={(e) => updateValue(index, "key", e.target.value)}
                placeholder="field_name"
                className="h-8"
              />
            </div>
            <div className="flex-2 space-y-1">
              <Label className="text-xs">Value (Handlebars)</Label>
              <MentionTextarea
                value={item.value}
                onChangeValue={(val) => updateValue(index, "value", val)}
                nodes={nodes}
                placeholder="value or {{ state.key }}"
                className="min-h-[38px] text-xs py-1"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeValue(index)}
              type="button"
              className="mt-6 h-8 w-8 text-destructive"
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {values.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No values configured
          </p>
        )}
      </div>

      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        <p className="font-semibold mb-1">Examples:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            Static text:{" "}
            <code className="bg-background px-1 rounded">active</code>
          </li>
          <li>
            From previous node:{" "}
            <code className="bg-background px-1 rounded">
              {"{{ nodes.[webhook].output.body.id }}"}
            </code>
          </li>
          <li>
            Math/Logic:{" "}
            <code className="bg-background px-1 rounded">
              {"{{add state.counter 1}}"}
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
};
