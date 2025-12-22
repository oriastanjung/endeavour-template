import type { NodeAction } from "../../../backend/types";

export const mergeAction: NodeAction = async (input, ctx) => {
  // Merge node simply passes through the state/input
  // De-duplication or waiting for multiple inputs is handled by the engine's graph traversal
  // (Assuming engine waits for all dependencies or triggers on any depending on logic)
  // For now, simple pass-through.

  await ctx.log("info", "Merge node executed");

  return {
    output: ctx.state,
    nextEdgeLabel: undefined,
  };
};
