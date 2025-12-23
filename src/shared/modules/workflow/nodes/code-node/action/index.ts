import type { NodeAction } from "../../../backend/types";
import { CodeNodeData } from "../../../types/Workflow";

export const codeAction: NodeAction = async (input, ctx) => {
  const config = input as CodeNodeData;
  const userCode = config.code || "return {};";

  try {
    // Pre-render Handlebars templates in the code string
    // This allows users to write: const data = {{nodes.[http-req].output.body}};
    // Which becomes: const data = {"results": [...]};
    const renderedCode = ctx.render(userCode, { input, state: ctx.state });

    // Create a function with access to context
    // We expose:
    // - ctx: The implementation context (logging, render, saveState, etc)
    // - input: The current state (ctx.state) - aliased for convenience
    // - state: The current state (ctx.state)
    // - nodes: Previous node outputs (ctx.nodes)
    // - render: Helper function to render Handlebars templates dynamically

    // Wrap in async function to allow await
    const asyncFunction = new Function(
      "ctx",
      "input",
      "state",
      "nodes",
      "render",
      `
      return (async () => {
        ${renderedCode}
      })();
    `
    );

    // Create a convenience render function for dynamic template rendering
    const renderHelper = (template: string) =>
      ctx.render(template, { input, state: ctx.state });

    const result = await asyncFunction(
      ctx,
      ctx.state,
      ctx.state,
      ctx.nodes,
      renderHelper
    );

    // Result should be the new state or patch?
    // Usually Code Node returns a patch or the whole object.
    // Let's assume it returns an object that MERGES into state, or replaces it?
    // Standard pattern: return { ... }; merged by engine if we return it as output.
    // Our return value here { output: ... } becomes the node run output.
    // If Code Node wants to update state, it can call `ctx.saveState(patch)`.

    if (typeof result === "object" && result !== null) {
      // Return it as output - accessible as nodes.[code-nodeId].output
      return {
        output: result,
        nextEdgeLabel: undefined,
      };
    }

    return {
      output: { result }, // Wrap non-object result
      nextEdgeLabel: undefined,
    };
  } catch (err: unknown) {
    const error = err as Error;
    await ctx.log("error", "Code Execution Failed", { message: error.message });
    throw new Error(`Code execution failed: ${error.message}`);
  }
};
