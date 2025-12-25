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

  let key = config.outputKey ?? config.key ?? "result";
  let captureAll = config.captureAll ?? true;
  let outputValue = config.outputValue ?? config.expression;

  // Smart detection: if outputKey looks like a path expression, treat it as the value to retrieve
  // This handles cases where users put "nodes.[nodeId].output.xxx" in the outputKey field
  const isPathExpression =
    key.includes("nodes.") ||
    key.includes("{{") ||
    key.includes("state.") ||
    key.match(/\.[a-zA-Z]+\-\d+\./);

  if (isPathExpression) {
    // User put an expression in outputKey, so use it as the value and reset key to "result"
    outputValue = key;
    key = "result";
    captureAll = false;
  }

  let valueExpression = captureAll
    ? "{{json state}}"
    : outputValue ?? "{{json state}}";

  // If the expression doesn't have handlebars syntax, wrap it
  if (!captureAll && !valueExpression.includes("{{")) {
    // It's a raw path like "nodes.[http.request-xxx].output.body.results"
    // First normalize the path format for handlebars bracket notation
    let varPath = valueExpression;

    // Handle complex node IDs with dashes (e.g., http.request-1234567)
    const complexNodeIdPattern = /nodes\.([a-zA-Z0-9_\.]+\-\d+)(\..+)?$/;
    const match = varPath.match(complexNodeIdPattern);

    if (match) {
      varPath = `nodes.[${match[1]}]${match[2] ?? ""}`;
    }

    valueExpression = `{{{json ${varPath}}}}`;
  } else if (!captureAll) {
    // Expression has handlebars syntax, ensure proper formatting
    const simpleVarPattern = /^\s*{{\s*([a-zA-Z0-9_\.\-\[\]"']+)\s*}}\s*$/;
    if (simpleVarPattern.test(valueExpression)) {
      let varPath = valueExpression.replace(simpleVarPattern, "$1");

      const complexNodeIdPattern = /^nodes\.([a-zA-Z0-9_\.]+\-\d+)(\..+)$/;
      const match = varPath.match(complexNodeIdPattern);

      if (match) {
        varPath = `nodes.[${match[1]}]${match[2]}`;
      }

      valueExpression = `{{{json ${varPath}}}}`;
    }
  }

  console.log("output node valueExpression >> ", valueExpression);

  // Render the expression with full context
  const value = ctx.render(valueExpression, { input, state: ctx.state });

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
