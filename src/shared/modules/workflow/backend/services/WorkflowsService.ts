// src/shared/modules/workflow/backend/services/WorkflowsService.ts
// Service for managing workflows

import { db as prisma } from "@/shared/database";
import { isValidDAG } from "../engine/graph";
import type { WorkflowNode, WorkflowEdge, Prisma } from "@prisma/client";

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
            label: edge.label,
            condition: edge.condition as Prisma.InputJsonValue,
          })),
        },
      },
      include: { nodes: true, edges: true },
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
    return prisma.$transaction(async (tx) => {
      // Update workflow metadata
      const workflow = await tx.workflow.update({
        where: { id },
        data: {
          ...data,
          version: { increment: 1 },
        },
      });

      // If nodes provided, replace all nodes
      if (nodes) {
        await tx.workflowNode.deleteMany({ where: { workflowId: id } });
        await tx.workflowNode.createMany({
          data: nodes.map((node) => ({
            id: node.id,
            workflowId: id,
            type: node.type,
            label: node.label,
            positionX: node.positionX,
            positionY: node.positionY,
            config: node.config as Prisma.InputJsonValue,
          })),
        });
      }

      // If edges provided, replace all edges
      if (edges) {
        await tx.workflowEdge.deleteMany({ where: { workflowId: id } });
        await tx.workflowEdge.createMany({
          data: edges.map((edge) => ({
            id: edge.id,
            workflowId: id,
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
            label: edge.label,
            condition: edge.condition as Prisma.InputJsonValue,
          })),
        });
      }

      return tx.workflow.findUnique({
        where: { id },
        include: { nodes: true, edges: true },
      });
    });
  }

  /**
   * Delete workflow
   */
  async delete(workflowId: string) {
    return prisma.workflow.delete({
      where: { id: workflowId },
    });
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

    return prisma.workflow.update({
      where: { id: workflowId },
      data: { isActive: !workflow.isActive },
    });
  }
}

// Singleton instance
export const workflowsService = new WorkflowsService();
