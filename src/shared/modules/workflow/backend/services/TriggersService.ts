// src/shared/modules/workflow/backend/services/TriggersService.ts
// Service for managing workflow triggers

import { db as prisma } from "@/shared/database";

export type CreateTriggerInput = {
  workflowId: string;
  type: "cron" | "manual" | "api";
  cronExpr?: string;
  timezone?: string;
};

export class TriggersService {
  /**
   * Create a trigger for a workflow
   */
  async create(input: CreateTriggerInput) {
    // Validate cron trigger has expression
    if (input.type === "cron" && !input.cronExpr) {
      throw new Error("Cron triggers require a cron expression");
    }

    return prisma.trigger.create({
      data: {
        workflowId: input.workflowId,
        type: input.type,
        cronExpr: input.cronExpr,
        timezone: input.timezone ?? "UTC",
        isActive: true,
      },
    });
  }

  /**
   * Get trigger by ID
   */
  async get(triggerId: string) {
    return prisma.trigger.findUnique({
      where: { id: triggerId },
      include: { workflow: true },
    });
  }

  /**
   * List triggers for a workflow
   */
  async listByWorkflow(workflowId: string) {
    return prisma.trigger.findMany({
      where: { workflowId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * List all active cron triggers
   */
  async listActiveCronTriggers() {
    return prisma.trigger.findMany({
      where: {
        type: "cron",
        isActive: true,
        workflow: { isActive: true },
      },
      include: { workflow: true },
    });
  }

  /**
   * Toggle trigger active status
   */
  async toggle(triggerId: string) {
    const trigger = await prisma.trigger.findUnique({
      where: { id: triggerId },
    });

    if (!trigger) {
      throw new Error("Trigger not found");
    }

    return prisma.trigger.update({
      where: { id: triggerId },
      data: { isActive: !trigger.isActive },
    });
  }

  /**
   * Update trigger
   */
  async update(
    triggerId: string,
    data: Partial<Pick<CreateTriggerInput, "cronExpr" | "timezone" | "type">>
  ) {
    return prisma.trigger.update({
      where: { id: triggerId },
      data,
    });
  }

  /**
   * Delete trigger
   */
  async delete(triggerId: string) {
    return prisma.trigger.delete({
      where: { id: triggerId },
    });
  }
}

// Singleton instance
export const triggersService = new TriggersService();
