import type { NodeAction } from "../../../backend/types";

export const webhookTriggerAction: NodeAction = async (input, ctx) => {
  // Webhook trigger receives payload from the external call that started the execution
  // The payload should be passed in `input` or `ctx.state` depending on engine design.
  // Assuming the engine passes the webhook body as input to this action.

  await ctx.log("info", "Webhook triggered", { payload: input });

  return {
    output: input as Record<string, unknown>,
    nextEdgeLabel: undefined,
  };
};
