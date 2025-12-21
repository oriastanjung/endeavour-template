// src/shared/modules/workflow/nodes/cron-trigger-node/action/index.ts
// Cron Trigger Node - Action

import type { NodeAction } from "../../../backend/types";

export const cronTriggerAction: NodeAction = async (input, ctx) => {
  const config = input as { payload?: Record<string, unknown> };

  await ctx.log("info", "Cron trigger tick", { payload: config.payload });

  // Save payload to state
  if (config.payload && Object.keys(config.payload).length > 0) {
    await ctx.saveState(config.payload);
  }

  return {
    output: {
      ...config.payload,
      triggeredAt: new Date().toISOString(),
    },
    nextEdgeLabel: undefined,
  };
};
