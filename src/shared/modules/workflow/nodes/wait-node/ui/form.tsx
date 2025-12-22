import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkflowNode } from "../../../types/Workflow";
import { MentionTextarea } from "../../../ui/components/mention-textarea";

export const WaitForm = ({
  data,
  updateData,
  nodes,
}: {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
  nodes: WorkflowNode[];
}) => {
  // Parsing: duration might be number or string (expression)
  const duration = (data.duration as string | number) ?? 5;
  const unit = (data.unit as string) || "seconds";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Duration (Number or Expression)</Label>
        {/* We use MentionTextarea to allow expressions, but it returns string. 
            Backend handles string->number conversion. */}
        <MentionTextarea
          value={String(duration)}
          onChangeValue={(val) => {
            // If user types a number, we can store as number or string.
            // Let's store as string if it contains non-digits to indicate expression
            updateData("duration", val);
          }}
          nodes={nodes}
          placeholder="5 or {{ state.duration }}"
          className="min-h-[38px] h-10 py-2"
        />
      </div>

      <div className="space-y-2">
        <Label>Unit</Label>
        <Select value={unit} onValueChange={(val) => updateData("unit", val)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="seconds">Seconds</SelectItem>
            <SelectItem value="minutes">Minutes</SelectItem>
            <SelectItem value="hours">Hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground mt-4">
        <p className="font-semibold mb-1">Examples:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            Static number: <code className="bg-background px-1 rounded">5</code>
          </li>
          <li>
            From state:{" "}
            <code className="bg-background px-1 rounded">
              {"{{ state.delay }}"}
            </code>
          </li>
          <li>
            From previous node:{" "}
            <code className="bg-background px-1 rounded">
              {"{{ nodes.step1.output.duration }}"}
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
};
