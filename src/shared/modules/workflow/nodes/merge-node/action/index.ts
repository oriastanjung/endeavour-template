import type { NodeAction } from "../../../backend/types";

export const mergeAction: NodeAction = async (input, ctx) => {
  // Merge node combines outputs ONLY from nodes that are directly connected to it
  // It uses ctx.incomingNodeIds to know which nodes have edges pointing to this merge node

  // Collect outputs only from directly connected incoming nodes
  const mergedData: Record<string, unknown> = {};
  const nodeOutputs: Record<string, unknown> = {};

  // Only process nodes that are directly connected via edges
  for (const nodeId of ctx.incomingNodeIds) {
    const nodeData = ctx.nodes[nodeId];
    if (nodeData?.output) {
      nodeOutputs[nodeId] = nodeData.output;

      // If output is an object, merge its properties into mergedData
      if (typeof nodeData.output === "object" && nodeData.output !== null) {
        Object.assign(mergedData, nodeData.output);
      }
    }
  }

  await ctx.log("info", "Merge node executed", {
    incomingNodes: ctx.incomingNodeIds,
    mergedNodeCount: Object.keys(nodeOutputs).length,
    mergedKeys: Object.keys(mergedData),
  });

  // Return both:
  // - merged: Flat merged data from connected nodes only
  // - nodes: Individual node outputs keyed by node ID (only connected nodes)
  return {
    output: {
      merged: mergedData,
      nodes: nodeOutputs,
    },
    nextEdgeLabel: undefined,
  };
};
