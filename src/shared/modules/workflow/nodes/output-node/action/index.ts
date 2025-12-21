// src/shared/modules/workflow/nodes/output-node/action/index.ts
// Output Node - Action

import type { NodeAction } from "../../../backend/types";

export const outputAction: NodeAction = async (input, ctx) => {
  const config = input as {
    key?: string;
    expression?: string;
  };

  const key = config.key ?? "result";
  const expression = config.expression ?? "{{json state}}";

  // Render the expression
  const value = ctx.render(expression);

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
