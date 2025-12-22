import type { NodeAction } from "../../../backend/types";
import { CodeNodeData } from "../../../types/Workflow";

export const codeAction: NodeAction = async (input, ctx) => {
  const config = input as CodeNodeData;
  const userCode = config.code || "return {};";

  try {
    // Create a function with access to context
    // We expose:
    // - ctx: The implementation context (logging, etc)
    // - input: The current state (ctx.state) - aliased for convenience
    // - state: The current state (ctx.state)
    // - nodes: Previous node outputs (ctx.nodes)

    // Wrap in async function to allow await
    const asyncFunction = new Function(
      "ctx",
      "input",
      "state",
      "nodes",
      `
      return (async () => {
        ${userCode}
      })();
    `
    );

    const result = await asyncFunction(ctx, ctx.state, ctx.state, ctx.nodes);

    // Result should be the new state or patch?
    // Usually Code Node returns a patch or the whole object.
    // Let's assume it returns an object that MERGES into state, or replaces it?
    // Standard pattern: return { ... }; merged by engine if we return it as output.
    // Wait, engine merges `output` into where?
    // Engine keeps `stateOut`.
    // Our return value here { output: ... } becomes the node run output.
    // Does it automatically merge into state?
    // In `node.worker.ts`, we call `saveState` if we want to partial update during run.
    // But at the end, `node.worker.ts` doesn't automatically merge output into state unless the node logic did it?
    // Wait, looking at `node.worker.ts`:
    // `executionState` is passed to next node.
    // `saveState` updates `workflowExecution.stateOut`.
    // But `nodeRun.output` is just stored in `nodeRun`.
    // So if Code Node wants to update state, it MUST return the *new state* or call `ctx.saveState`.
    // Or we expect the Code Node to return an object that IS the new state?
    // Let's assume Code Node returns an object that REPLACES or MERGES?
    // Usually "code" node transforms inputs to outputs.
    // If user returns `return { foo: 1 }`, does next node see `state.foo`?
    // Only if we merge it.
    // Let's merge the result into state for convenience.

    if (typeof result === "object" && result !== null) {
      // We merge result into global state (?)
      // Actually, let's just return it as output.
      // If user wants to update state, they can do `ctx.saveState(result)`.
      // But for convenience, let's treat the return value as the "output" of this node,
      // AND maybe we shouldn't implicitly merge it into global state unless configured?
      // Set Node explicitly merges.
      // Code Node might just calculate something.
      // But normally in easy workflows, code output is available as `nodes.code.output`.
      // So we return it.
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
