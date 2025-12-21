// src/shared/modules/workflow/nodes/output-node/action/index.ts
// Output Node - Action

import type { NodeAction } from "../../../backend/types";

export const outputAction: NodeAction = async (input, ctx) => {
  const config = input as {
    outputKey?: string;
    outputValue?: string;
    captureAll?: boolean;
    // Legacy support
    key?: string;
    expression?: string;
  };

  const key = config.outputKey ?? config.key ?? "result";
  const captureAll = config.captureAll ?? true;

  // Determine what value to output
  // If captureAll is true, we output the entire state (JSON stringified)
  // If false, we render the outputValue template
  let valueExpression = captureAll
    ? "{{json state}}"
    : config.outputValue ?? config.expression ?? "{{json state}}";

  // DX Improvement: If the expression is a simple variable reference like {{nodes.foo.bar}},
  // Handlebars defaults to [object Object] for objects. We want to auto-wrap in {{json ...}}
  // so that we can parse it back to the real object.
  // Regex matches: ^{{ optional_space variable_path optional_space }}$
  const simpleVarPattern = /^\s*{{\s*([a-zA-Z0-9_\.\-]+)\s*}}\s*$/;
  if (!captureAll && simpleVarPattern.test(valueExpression)) {
    // Check if it's not already using a helper (simple heuristic: no spaces inside the braces except padding)
    valueExpression = valueExpression.replace(
      simpleVarPattern,
      "{{{json $1}}}"
    );
  }

  // Render the expression
  const value = ctx.render(valueExpression);

  // Try to parse as JSON if possible
  let parsedValue: unknown = value;
  try {
    parsedValue = JSON.parse(value);
  } catch {
    // Keep as string
  }

  // Save to execution state
  await ctx.saveState({ [key]: parsedValue });

  await ctx.log("info", "Output captured", { key, value: parsedValue });

  return {
    output: { key, value: parsedValue },
    nextEdgeLabel: undefined,
  };
};
