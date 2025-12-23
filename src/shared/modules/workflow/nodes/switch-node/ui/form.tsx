import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { SwitchNodeData, WorkflowNode } from "../../../types/Workflow";
import { MentionTextarea } from "../../../ui/components/mention-textarea";

export const SwitchForm = ({
  data,
  updateData,
  nodes,
}: {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
  nodes: WorkflowNode[];
}) => {
  const switchData = data as SwitchNodeData;
  const conditions = switchData.conditions || [];

  const addCondition = () => {
    const newCondition = {
      id: `cond-${Date.now()}`,
      label: `Case ${conditions.length + 1}`,
      expression: "",
    };
    updateData("conditions", [...conditions, newCondition]);
  };

  const removeCondition = (index: number) => {
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    updateData("conditions", newConditions);
  };

  const updateCondition = (index: number, field: string, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    updateData("conditions", newConditions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Conditions (Routes)</Label>
        <Button
          size="sm"
          variant="outline"
          onClick={addCondition}
          type="button"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Case
        </Button>
      </div>

      <div className="space-y-3">
        {conditions.map((condition, index) => (
          <div
            key={index}
            className="space-y-4 p-3 border rounded-md relative bg-muted/10"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => removeCondition(index)}
              type="button"
            >
              <Trash className="w-4 h-4 text-destructive" />
            </Button>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={condition.label}
                  onChange={(e) =>
                    updateCondition(index, "label", e.target.value)
                  }
                  className="h-8"
                  placeholder="Case Label"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Expression (Handlebars)</Label>
                <MentionTextarea
                  value={condition.expression}
                  onChangeValue={(val) =>
                    updateCondition(index, "expression", val)
                  }
                  nodes={nodes}
                  className="min-h-[60px] text-xs"
                  placeholder="{{eq nodes.[step1].output.status 'success'}}"
                />
              </div>
            </div>
          </div>
        ))}
        {conditions.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No conditions added
          </div>
        )}
      </div>

      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground mt-4">
        <p className="font-semibold mb-1">Examples:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            Equals:{" "}
            <code className="bg-background px-1 rounded">
              {"{{eq nodes.[step1].output.status 'success'}}"}
            </code>
          </li>
          <li>
            Greater than:{" "}
            <code className="bg-background px-1 rounded">
              {"{{gt nodes.[order].output.amount 100}}"}
            </code>
          </li>
          <li>
            Contains text:{" "}
            <code className="bg-background px-1 rounded">
              {"{{contains state.email '@gmail.com'}}"}
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
};
