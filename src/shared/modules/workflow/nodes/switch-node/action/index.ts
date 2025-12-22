import type { NodeAction } from "../../../backend/types";
import { SwitchNodeData } from "../../../types/Workflow";

export const switchAction: NodeAction = async (input, ctx) => {
  const config = input as SwitchNodeData;
  const conditions = config.conditions || [];

  let matchedCaseId: string | undefined;

  for (const condition of conditions) {
    const expression = condition.expression || "false";

    // Render the expression using Handlebars
    // We expect the expression to evaluate to "true" string if it matches
    // e.g. "{{eq state.value 1}}" -> "true"
    const rendered = ctx.render(expression, { input, state: ctx.state });

    // Check truthiness (string "true" or actual boolean true if render returns that, though standard HB returns string)
    const isTrue = String(rendered).trim().toLowerCase() === "true";

    if (isTrue) {
      matchedCaseId = condition.id;
      await ctx.log("info", `Switch matched case: ${condition.label}`, {
        expression,
        rendered,
      });
      break; // Stop at first match (Switch behavior)
    }
  }

  // If matched, nextEdgeLabel is the case ID. The engine uses this to find the edge.
  return {
    output: { ...ctx.state },
    nextEdgeLabel: matchedCaseId,
  };
};
