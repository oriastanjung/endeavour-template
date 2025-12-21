// src/shared/modules/workflow/nodes/condition-node/action/index.ts
// Condition Node - Action

import type { NodeAction } from "../../../backend/types";

export const conditionAction: NodeAction = async (input, ctx) => {
  const config = input as {
    expression?: string;
    trueLabel?: string;
    falseLabel?: string;
  };

  const expression = config.expression ?? "";
  const trueLabel = config.trueLabel ?? "true";
  const falseLabel = config.falseLabel ?? "false";

  // Render the expression with context
  const rendered = ctx.render(expression, { input, state: ctx.state });
  const decision = String(rendered).trim().toLowerCase() === "true";

  await ctx.log("info", "Conditional evaluated", {
    expression,
    rendered,
    decision,
  });

  return {
    output: { decision, rendered },
    nextEdgeLabel: decision ? trueLabel : falseLabel,
  };
};
