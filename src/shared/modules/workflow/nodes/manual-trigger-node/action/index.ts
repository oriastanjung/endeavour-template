// src/shared/modules/workflow/nodes/manual-trigger-node/action/index.ts
// Manual Trigger Node - Action

import type { NodeAction } from "../../../backend/types";

export const manualTriggerAction: NodeAction = async (input, ctx) => {
  const config = input as { payload?: Record<string, unknown> };

  await ctx.log("info", "Manual trigger fired", { payload: config.payload });

  // Save payload to state
  if (config.payload && Object.keys(config.payload).length > 0) {
    await ctx.saveState(config.payload);
  }

  return {
    output: config.payload ?? {},
    nextEdgeLabel: undefined, // Proceed to all connected nodes
  };
};
