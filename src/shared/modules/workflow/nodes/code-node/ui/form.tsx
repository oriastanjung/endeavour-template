import React from "react";
import { Label } from "@/components/ui/label";
import { CodeNodeData, WorkflowNode } from "../../../types/Workflow";
import { MentionTextarea } from "../../../ui/components/mention-textarea";

export const CodeForm = ({
  data,
  updateData,
  nodes,
}: {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
  nodes: WorkflowNode[];
}) => {
  const codeData = data as CodeNodeData;
  const code = codeData.code || "";

  return (
    <div className="space-y-2 h-full flex flex-col">
      <Label>Custom JavaScript</Label>
      <div className="flex-1 min-h-[300px]">
        <MentionTextarea
          value={code}
          onChangeValue={(val) => updateData("code", val)}
          nodes={nodes}
          className="font-mono text-xs h-full min-h-[300px]"
          placeholder="// Available: ctx, input, state, nodes"
        />
      </div>
      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground mt-2">
        <p className="font-semibold mb-1">Examples:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            Return new object:
            <code className="bg-background px-1 rounded block mt-1 p-1">
              {"return { calculated: input.value * 2 };"}
            </code>
          </li>
          <li>
            Access previous node:
            <code className="bg-background px-1 rounded block mt-1 p-1">
              {"const data = nodes['http-req'].output.body;"}
              <br />
              {"return { processed: data.results };"}
            </code>
          </li>
          <li>
            Async/Await:
            <code className="bg-background px-1 rounded block mt-1 p-1">
              {"const res = await fetch('https://api.example.com');"}
              <br />
              {"return await res.json();"}
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
};
