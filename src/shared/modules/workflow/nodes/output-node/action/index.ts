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

  console.log("input output node >> ", input);
  const key = config.outputKey ?? config.key ?? "result";
  const captureAll = config.captureAll ?? true;

  let valueExpression = captureAll
    ? "{{json state}}"
    : config.outputValue ?? config.expression ?? "{{json state}}";

  const simpleVarPattern = /^\s*{{\s*([a-zA-Z0-9_\.\-\[\]"']+)\s*}}\s*$/;
  if (!captureAll && simpleVarPattern.test(valueExpression)) {
    let varPath = valueExpression.replace(simpleVarPattern, "$1");

    const complexNodeIdPattern = /^nodes\.([a-zA-Z0-9_\.]+\-\d+)(\..+)$/;
    const match = varPath.match(complexNodeIdPattern);

    if (match) {
      varPath = `nodes.[${match[1]}]${match[2]}`;
    }

    valueExpression = `{{{json ${varPath}}}}`;
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
