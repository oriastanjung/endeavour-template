import type { NodeAction } from "../../../backend/types";
import { SetNodeData } from "../../../types/Workflow";

export const setAction: NodeAction = async (input, ctx) => {
  const config = input as SetNodeData;
  const values = config.values || [];

  const patch: Record<string, unknown> = {};

  for (const item of values) {
    if (item.key) {
      // Render value using Handlebars
      const renderedValue = ctx.render(item.value, { input, state: ctx.state });
      patch[item.key] = renderedValue;
    }
  }

  await ctx.log("info", `Set ${Object.keys(patch).length} values`, { patch });

  return {
    output: { ...ctx.state, ...patch },
    nextEdgeLabel: undefined,
  };
};
