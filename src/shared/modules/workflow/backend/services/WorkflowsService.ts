// src/shared/modules/workflow/backend/services/WorkflowsService.ts
// Service for managing workflows

import { db as prisma } from "@/shared/database";
import { isValidDAG } from "../engine/graph";
import type { WorkflowNode, WorkflowEdge, Prisma } from "@prisma/client";
import { registerCronTriggers } from "../workers/workflow.worker";

export type CreateWorkflowInput = {
  name: string;
  description?: string;
  ownerId: string;
  nodes: {
    id: string;
    type: string;
    label?: string;
    positionX: number;
    positionY: number;
    config: Record<string, unknown>;
  }[];
  edges: {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    label?: string;
    condition?: unknown;
  }[];
};

export type UpdateWorkflowInput = {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  nodes?: CreateWorkflowInput["nodes"];
  edges?: CreateWorkflowInput["edges"];
};

export class WorkflowsService {
  /**
   * Create a new workflow
   */
  async create(input: CreateWorkflowInput) {
    // Validate DAG structure
    const mockNodes = input.nodes.map((n) => ({
      id: n.id,
      workflowId: "",
      type: n.type,
      label: n.label ?? null,
      positionX: n.positionX,
      positionY: n.positionY,
      config: n.config as Prisma.JsonValue,
      stateSchema: null as Prisma.JsonValue,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as WorkflowNode[];

    const mockEdges = input.edges.map((e) => ({
      id: e.id,
      workflowId: "",
      sourceNodeId: e.sourceNodeId,
      targetNodeId: e.targetNodeId,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
      label: e.label ?? null,
      condition: (e.condition ?? null) as Prisma.JsonValue,
      config: null as Prisma.JsonValue,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as WorkflowEdge[];

    if (!isValidDAG(mockNodes, mockEdges)) {
      throw new Error("Invalid workflow: contains cycles");
    }

    // Create workflow with nodes and edges
    const workflow = await prisma.workflow.create({
      data: {
        name: input.name,
        description: input.description,
        ownerId: input.ownerId,
        nodes: {
          create: input.nodes.map((node) => ({
            id: node.id,
            type: node.type,
            label: node.label,
            positionX: node.positionX,
            positionY: node.positionY,
            config: node.config as Prisma.InputJsonValue,
          })),
        },
        edges: {
          create: input.edges.map((edge) => ({
            id: edge.id,
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            label: edge.label,
            condition: edge.condition as Prisma.InputJsonValue,
          })),
        },
      },
      include: { nodes: true, edges: true },
    });

    // Refresh cron triggers
    await registerCronTriggers().catch((err) => {
      console.error("Failed to refresh cron triggers:", err);
    });

    return workflow;
  }

  /**
   * Get workflow by ID
   */
  async get(workflowId: string) {
    return prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true, edges: true, triggers: true },
    });
  }

  /**
   * List workflows for an owner
   */
  async list(
    ownerId: string,
    options?: { page?: number; limit?: number; keyword?: string }
  ) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ownerId,
      ...(options?.keyword && {
        OR: [
          { name: { contains: options.keyword, mode: "insensitive" as const } },
          {
            description: {
              contains: options.keyword,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: { select: { nodes: true, executions: true } },
        },
      }),
      prisma.workflow.count({ where }),
    ]);

    return { workflows, total, page, limit };
  }

  /**
   * Update workflow
   */
  async update(input: UpdateWorkflowInput) {
    const { id, nodes, edges, ...data } = input;

    // If nodes/edges are provided, validate DAG
    if (nodes && edges) {
      const mockNodes = nodes.map((n) => ({
        id: n.id,
        workflowId: id,
        type: n.type,
        label: n.label ?? null,
        positionX: n.positionX,
        positionY: n.positionY,
        config: n.config as Prisma.JsonValue,
        stateSchema: null as Prisma.JsonValue,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as WorkflowNode[];

      const mockEdges = edges.map((e) => ({
        id: e.id,
        workflowId: id,
        sourceNodeId: e.sourceNodeId,
        targetNodeId: e.targetNodeId,
        sourceHandle: e.sourceHandle ?? null,
        targetHandle: e.targetHandle ?? null,
        label: e.label ?? null,
        condition: (e.condition ?? null) as Prisma.JsonValue,
        config: null as Prisma.JsonValue,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as WorkflowEdge[];

      if (!isValidDAG(mockNodes, mockEdges)) {
        throw new Error("Invalid workflow: contains cycles");
      }
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update workflow metadata
      await tx.workflow.update({
        where: { id },
        data: {
          ...data,
          version: { increment: 1 },
        },
      });

      // SYNC LOGIC with FK Safety & Consistency:

      // 1. Fetch current state UNCONDITIONALLY to allow validation
      const existingNodes = await tx.workflowNode.findMany({
        where: { workflowId: id },
        select: { id: true },
      });
      const existingNodeIds = new Set(existingNodes.map((n) => n.id));

      const existingEdges = await tx.workflowEdge.findMany({
        where: { workflowId: id },
        select: { id: true },
      });
      const existingEdgeIds = new Set(existingEdges.map((e) => e.id));

      // 2. Validate & Filter Inputs
      // We must ignore edges that point to nodes that won't exist after this update.
      // Active Nodes = Nodes in the input list (if provided) OR existing nodes in DB (if nodes arg not provided, meaning no changes to nodes)
      const activeNodeIds = nodes
        ? new Set(nodes.map((n) => n.id))
        : existingNodeIds;

      // Filter input edges (if provided) to ensure they only connect currently active nodes
      const validEdges =
        edges?.filter(
          (e) =>
            activeNodeIds.has(e.sourceNodeId) &&
            activeNodeIds.has(e.targetNodeId)
        ) ?? [];

      // 3. DELETE PHASE (Edges first, then Nodes)
      if (edges) {
        // Use validEdges to determine what to keep.
        // Any edge NOT in validEdges (including zombies) will be treated as "removed" and deleted.
        const inputEdgeIds = new Set(validEdges.map((e) => e.id));
        const edgesToDelete = existingEdges.filter(
          (e) => !inputEdgeIds.has(e.id)
        );

        if (edgesToDelete.length > 0) {
          await tx.workflowEdge.deleteMany({
            where: {
              id: { in: edgesToDelete.map((e) => e.id) },
              workflowId: id,
            },
          });
        }
      }

      if (nodes) {
        const inputNodeIds = new Set(nodes.map((n) => n.id));
        const nodesToDelete = existingNodes.filter(
          (n) => !inputNodeIds.has(n.id)
        );
        if (nodesToDelete.length > 0) {
          await tx.workflowNode.deleteMany({
            where: {
              id: { in: nodesToDelete.map((n) => n.id) },
              workflowId: id,
            },
          });
        }
      }

      // 3. UPSERT PHASE (Nodes first, then Edges)
      if (nodes) {
        // Upsert nodes
        for (const node of nodes) {
          const nodeData = {
            type: node.type,
            label: node.label,
            positionX: node.positionX,
            positionY: node.positionY,
            config: node.config as Prisma.InputJsonValue,
          };

          if (existingNodeIds.has(node.id)) {
            await tx.workflowNode.update({
              where: { id: node.id },
              data: nodeData,
            });
          } else {
            await tx.workflowNode.create({
              data: {
                ...nodeData,
                id: node.id,
                workflowId: id,
              },
            });
          }
        }
      }

      if (edges) {
        // Upsert edges (using validEdges to avoid zombies)
        for (const edge of validEdges) {
          const edgeData = {
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            label: edge.label,
            condition: edge.condition as Prisma.InputJsonValue,
          };

          if (existingEdgeIds.has(edge.id)) {
            await tx.workflowEdge.update({
              where: { id: edge.id },
              data: edgeData,
            });
          } else {
            await tx.workflowEdge.create({
              data: {
                ...edgeData,
                id: edge.id,
                workflowId: id,
              },
            });
          }
        }
      }

      return tx.workflow.findUnique({
        where: { id },
        include: { nodes: true, edges: true },
      });
    });

    // Refresh cron triggers
    await registerCronTriggers().catch((err) => {
      console.error("Failed to refresh cron triggers:", err);
    });

    return result;
  }

  /**
   * Delete workflow
   */
  async delete(workflowId: string) {
    const result = await prisma.workflow.delete({
      where: { id: workflowId },
    });

    // Refresh cron triggers
    await registerCronTriggers().catch((err) => {
      console.error("Failed to refresh cron triggers:", err);
    });

    return result;
  }

  /**
   * Toggle workflow active status
   */
  async toggleActive(workflowId: string) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new Error("Workflow not found");
    }

    const result = await prisma.workflow.update({
      where: { id: workflowId },
      data: { isActive: !workflow.isActive },
    });

    // Refresh cron triggers
    await registerCronTriggers().catch((err) => {
      console.error("Failed to refresh cron triggers:", err);
    });

    return result;
  }
}

// Singleton instance
export const workflowsService = new WorkflowsService();
