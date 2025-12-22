import type { NodeAction } from "../../../backend/types";
import { EditFieldsNodeData } from "../../../types/Workflow";

export const editFieldsAction: NodeAction = async (input, ctx) => {
  const config = input as EditFieldsNodeData;
  const mode = config.mode || "append";
  const fields = config.fields || [];

  // Prepare the new values map by rendering expressions
  const fieldUpdates: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.key) {
      fieldUpdates[field.key] = ctx.render(field.value, {
        input,
        state: ctx.state,
      });
    }
  }

  let output: Record<string, unknown> = {};

  if (mode === "keep_only") {
    // Keep ONLY the fields specified in 'fields' (masked state)
    // We assume if they specified a value, they want to SET it.
    // If they just wanted to keep existing, they might need to use {{ state.key }} as value.
    output = { ...fieldUpdates };
  } else {
    // Append / Overwrite
    output = { ...ctx.state, ...fieldUpdates };
  }

  await ctx.log("info", `Edit Fields (${mode})`, {
    keys: Object.keys(fieldUpdates),
  });

  return {
    output,
    nextEdgeLabel: undefined,
  };
};
