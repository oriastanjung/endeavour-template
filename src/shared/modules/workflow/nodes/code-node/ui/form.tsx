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
      <div className="min-h-[10vh]">
        <MentionTextarea
          value={code}
          onChangeValue={(val) => updateData("code", val)}
          nodes={nodes}
          className="font-mono text-xs h-full min-h-[10vh]"
          placeholder="// Available: ctx, input, state, nodes, render"
        />
      </div>

      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground mt-2 space-y-3">
        <div>
          <p className="font-semibold mb-1">Available Variables:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>
              <code className="bg-background px-1 rounded">state</code> -
              Current execution state
            </li>
            <li>
              <code className="bg-background px-1 rounded">nodes</code> -
              Previous node outputs
            </li>
            <li>
              <code className="bg-background px-1 rounded">ctx</code> - Context
              (log, saveState, render)
            </li>
            <li>
              <code className="bg-background px-1 rounded">
                render(template)
              </code>{" "}
              - Render Handlebars dynamically
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold mb-1">Examples:</p>
          <ul className="list-disc pl-4 space-y-2">
            <li>
              <span className="text-muted-foreground">
                ✅ Access node output (use bracket for special chars):
              </span>
              <code className="bg-background px-1 rounded block mt-1 p-1 whitespace-pre-wrap">
                {
                  "const data = nodes['http.request-123'].output;\nreturn { processed: data.body.results };"
                }
              </code>
            </li>
            <li>
              <span className="text-muted-foreground">
                Dynamic template rendering:
              </span>
              <code className="bg-background px-1 rounded block mt-1 p-1 whitespace-pre-wrap">
                {
                  "const msg = render('Hello {{state.name}}!');\nreturn { greeting: msg };"
                }
              </code>
            </li>
            <li>
              <span className="text-muted-foreground">
                Async/Await with fetch:
              </span>
              <code className="bg-background px-1 rounded block mt-1 p-1 whitespace-pre-wrap">
                {
                  "const res = await fetch('https://api.example.com');\nreturn await res.json();"
                }
              </code>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold mb-1">💡 How it works:</p>
          <p className="mb-2 opacity-80">
            Your code is wrapped in an async function:
          </p>
          <code className="bg-background px-2 py-1 rounded block whitespace-pre-wrap text-[10px] leading-relaxed">
            {`(async function(ctx, input, state, nodes, render) {
  // ✏️ Your code goes here
  ${code || "// ..."}
})();`}
          </code>
        </div>
      </div>
    </div>
  );
};
