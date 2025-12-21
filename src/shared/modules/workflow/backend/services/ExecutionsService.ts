// src/shared/modules/workflow/backend/services/ExecutionsService.ts
// Service for managing workflow executions

import { db as prisma } from "@/shared/database";
import { getStartNodes } from "../engine/graph";

export class ExecutionsService {
  /**
   * Start a manual workflow execution
   */
  async runWorkflowManual(
    workflowId: string,
    stateIn?: Record<string, unknown>
  ): Promise<string> {
    // Fetch workflow with nodes and edges
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true, edges: true },
    });

    if (!workflow || !workflow.isActive) {
      throw new Error("Workflow not found or inactive");
    }

    // Create execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        triggerType: "manual",
        status: "RUNNING",
        startedAt: new Date(),
        stateIn: (stateIn ?? {}) as object,
        stateOut: {},
      },
    });

    // Find start nodes (triggers)
    const startNodes = getStartNodes(workflow.nodes);

    if (startNodes.length === 0) {
      // No triggers found, mark as failed
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          error: { message: "No trigger nodes found in workflow" },
        },
      });
      throw new Error("No trigger nodes found in workflow");
    }

    // Create pending node runs for start nodes
    for (const node of startNodes) {
      await prisma.workflowNodeRun.create({
        data: {
          executionId: execution.id,
          workflowId,
          nodeId: node.id,
          status: "PENDING",
        },
      });
    }

    return execution.id;
  }

  /**
   * Get execution by ID with node runs
   */
  async getExecution(executionId: string) {
    return prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        nodeRuns: {
          include: { node: true },
          orderBy: { createdAt: "asc" },
        },
        workflow: true,
      },
    });
  }

  /**
   * List executions for a workflow
   */
  async listExecutions(
    workflowId: string,
    options?: { page?: number; limit?: number }
  ) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [executions, total] = await Promise.all([
      prisma.workflowExecution.findMany({
        where: { workflowId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          nodeRuns: { select: { id: true, status: true } },
        },
      }),
      prisma.workflowExecution.count({ where: { workflowId } }),
    ]);

    return { executions, total, page, limit };
  }

  /**
   * Cancel an execution
   */
  async cancelExecution(executionId: string) {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      throw new Error("Execution not found");
    }

    if (execution.status !== "RUNNING" && execution.status !== "PENDING") {
      throw new Error("Execution is not running");
    }

    // Update execution status
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: "CANCELED",
        finishedAt: new Date(),
      },
    });

    // Cancel all pending node runs
    await prisma.workflowNodeRun.updateMany({
      where: {
        executionId,
        status: { in: ["PENDING", "RUNNING"] },
      },
      data: { status: "CANCELED" },
    });

    return true;
  }

  /**
   * Mark a node run as started
   */
  async startNodeRun(nodeRunId: string) {
    return prisma.workflowNodeRun.update({
      where: { id: nodeRunId },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
      },
    });
  }

  /**
   * Mark a node run as completed
   */
  async completeNodeRun(nodeRunId: string, output: unknown, input?: unknown) {
    return prisma.workflowNodeRun.update({
      where: { id: nodeRunId },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        output: output as object,
        input: input as object,
      },
    });
  }

  /**
   * Mark a node run as failed
   */
  async failNodeRun(nodeRunId: string, error: unknown) {
    return prisma.workflowNodeRun.update({
      where: { id: nodeRunId },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        error: error as object,
      },
    });
  }

  /**
   * Update execution state
   */
  async updateExecutionState(
    executionId: string,
    statePatch: Record<string, unknown>
  ) {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      throw new Error("Execution not found");
    }

    const currentState = (execution.stateOut as Record<string, unknown>) ?? {};
    const mergedState = { ...currentState, ...statePatch };

    return prisma.workflowExecution.update({
      where: { id: executionId },
      data: { stateOut: mergedState as object },
    });
  }

  /**
   * Complete an execution
   */
  async completeExecution(
    executionId: string,
    status: "SUCCESS" | "FAILED",
    error?: unknown
  ) {
    return prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status,
        finishedAt: new Date(),
        error: error as object,
      },
    });
  }

  /**
   * Check if execution is complete (no pending/running nodes)
   */
  async checkExecutionComplete(executionId: string): Promise<boolean> {
    const remaining = await prisma.workflowNodeRun.count({
      where: {
        executionId,
        status: { in: ["PENDING", "RUNNING"] },
      },
    });
    return remaining === 0;
  }
}

// Singleton instance
export const executionsService = new ExecutionsService();
