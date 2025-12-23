// src/shared/modules/workflow/backend/engine/graph.ts
// DAG utilities for workflow graph traversal

import type { WorkflowNode, WorkflowEdge } from "@prisma/client";

export type GraphNode = {
  id: string;
  type: string;
  config: unknown;
  label?: string | null;
};

export type GraphEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string | null;
  condition?: unknown;
};

export type AdjacencyMap = Map<string, GraphEdge[]>;

/**
 * Build adjacency map from nodes and edges
 */
export function buildGraph(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): AdjacencyMap {
  const adjacency: AdjacencyMap = new Map();

  // Initialize all nodes in the map
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }

  // Add edges to adjacency
  for (const edge of edges) {
    const existing = adjacency.get(edge.sourceNodeId) || [];
    existing.push({
      id: edge.id,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      label: edge.label,
      condition: edge.condition,
    });
    adjacency.set(edge.sourceNodeId, existing);
  }

  return adjacency;
}

/**
 * Get start nodes (trigger types)
 */
export function getStartNodes(nodes: WorkflowNode[]): WorkflowNode[] {
  return nodes.filter(
    (node) =>
      node.type === "manual.trigger" ||
      node.type === "cron.trigger" ||
      node.type.endsWith(".trigger")
  );
}

/**
 * Get next nodes based on current node and optional edge label
 */
export function computeNextNodes(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  currentNodeId: string,
  edgeLabel?: string
): WorkflowNode[] {
  // Find all outgoing edges from current node
  const outgoingEdges = edges.filter(
    (edge) => edge.sourceNodeId === currentNodeId
  );

  console.log(
    `[computeNextNodes] From node ${currentNodeId}, edgeLabel=${edgeLabel}`
  );
  console.log(
    `[computeNextNodes] Outgoing edges:`,
    outgoingEdges.map((e) => ({
      id: e.id,
      target: e.targetNodeId,
      label: e.label,
      sourceHandle: e.sourceHandle,
    }))
  );

  // If edge label/handle specified, filter by label OR sourceHandle
  const matchingEdges = edgeLabel
    ? outgoingEdges.filter(
        (edge) => edge.label === edgeLabel || edge.sourceHandle === edgeLabel
      )
    : outgoingEdges;

  console.log(
    `[computeNextNodes] Matching edges:`,
    matchingEdges.map((e) => ({
      id: e.id,
      target: e.targetNodeId,
    }))
  );

  // Get target nodes
  const targetNodeIds = matchingEdges.map((edge) => edge.targetNodeId);
  return nodes.filter((node) => targetNodeIds.includes(node.id));
}

/**
 * Check if graph is a valid DAG (no cycles)
 */
export function isValidDAG(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): boolean {
  const adjacency = buildGraph(nodes, edges);
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoing = adjacency.get(nodeId) || [];
    for (const edge of outgoing) {
      if (hasCycle(edge.targetNodeId)) return true;
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (hasCycle(node.id)) return false;
  }

  return true;
}

/**
 * Get all nodes in topological order
 */
export function topologicalSort(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const adjacency = buildGraph(nodes, edges);
  const visited = new Set<string>();
  const result: WorkflowNode[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  function visit(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const outgoing = adjacency.get(nodeId) || [];
    for (const edge of outgoing) {
      visit(edge.targetNodeId);
    }

    const node = nodeMap.get(nodeId);
    if (node) result.unshift(node);
  }

  for (const node of nodes) {
    visit(node.id);
  }

  return result;
}
