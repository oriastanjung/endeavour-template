import type { NodeAction } from "../../../backend/types";
import { WaitNodeData } from "../../../types/Workflow";

export const waitAction: NodeAction = async (input, ctx) => {
  const config = input as WaitNodeData;
  let duration = config.duration ?? 0;
  const unit = config.unit || "seconds";

  // Check if duration is a string expression
  if (typeof duration === "string") {
    const rendered = ctx.render(duration, { input, state: ctx.state });
    const parsed = parseInt(rendered, 10);
    if (!isNaN(parsed)) {
      duration = parsed;
    } else {
      await ctx.log(
        "warn",
        `Wait duration evaluated to NaN: ${rendered} (from ${duration}). Defaulting to 1`
      );
      duration = 1;
    }
  }

  // Calculate milliseconds
  let ms = 0;
  switch (unit) {
    case "seconds":
      ms = duration * 1000;
      break;
    case "minutes":
      ms = duration * 60 * 1000;
      break;
    case "hours":
      // Cap at reasonable max for setTimeout?
      // User should generally use BullMQ delay for long waits, but this is the mvp impl.
      ms = duration * 60 * 60 * 1000;
      break;
  }

  await ctx.log("info", `Waiting for ${duration} ${unit} (${ms}ms)`);

  // Blocking wait (MVP)
  // In production, this should return a suspended state or schedule a delayed job.
  await new Promise((resolve) => setTimeout(resolve, ms));

  return {
    output: { ...ctx.state },
    nextEdgeLabel: undefined,
  };
};
