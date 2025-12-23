// src/shared/modules/workflow/backend/trpc/router.ts
// tRPC router for workflow API

import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/backend/trpc/init";
import { workflowsService } from "../services/WorkflowsService";
import { executionsService } from "../services/ExecutionsService";
import { triggersService } from "../services/TriggersService";
import { addNodeJob } from "../queue";
import { getStartNodes } from "../engine/graph";
import { db } from "@/shared/database";

// Input schemas
const CreateWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ownerId: z.string().optional().default("demo-user"),
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      label: z.string().optional(),
      positionX: z.number(),
      positionY: z.number(),
      config: z.record(z.string(), z.any()),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      sourceNodeId: z.string(),
      targetNodeId: z.string(),
      sourceHandle: z.string().optional().nullable(),
      targetHandle: z.string().optional().nullable(),
      label: z.string().optional(),
      condition: z.unknown().optional(),
    })
  ),
});

const UpdateWorkflowSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  nodes: CreateWorkflowSchema.shape.nodes.optional(),
  edges: CreateWorkflowSchema.shape.edges.optional(),
});

const ListWorkflowsSchema = z.object({
  ownerId: z.string().optional().default("demo-user"),
  page: z.number().optional(),
  limit: z.number().optional(),
  keyword: z.string().optional(),
});

const RunManualSchema = z.object({
  workflowId: z.string(),
  stateIn: z.record(z.string(), z.any()).optional(),
});

const ListExecutionsSchema = z.object({
  workflowId: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

const CreateTriggerSchema = z.object({
  workflowId: z.string(),
  type: z.enum(["cron", "manual", "api"]),
  cronExpr: z.string().optional(),
  timezone: z.string().optional(),
});

// Router
export const workflowRouter = createTRPCRouter({
  // Workflow CRUD
  create: baseProcedure
    .input(CreateWorkflowSchema)
    .mutation(async ({ input }) => {
      return workflowsService.create(input);
    }),

  get: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return workflowsService.get(input.id);
    }),

  list: baseProcedure.input(ListWorkflowsSchema).query(async ({ input }) => {
    return workflowsService.list(input.ownerId, {
      page: input.page,
      limit: input.limit,
      keyword: input.keyword,
    });
  }),

  update: baseProcedure
    .input(UpdateWorkflowSchema)
    .mutation(async ({ input }) => {
      return workflowsService.update(input);
    }),

  delete: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return workflowsService.delete(input.id);
    }),

  toggleActive: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return workflowsService.toggleActive(input.id);
    }),

  // Execution operations
  runManual: baseProcedure
    .input(RunManualSchema)
    .mutation(async ({ input }) => {
      // Create execution and get start nodes
      const executionId = await executionsService.runWorkflowManual(
        input.workflowId,
        input.stateIn as Record<string, unknown>
      );

      // Get workflow to find start nodes
      const workflow = await db.workflow.findUnique({
        where: { id: input.workflowId },
        include: { nodes: true },
      });

      if (workflow) {
        const startNodes = getStartNodes(workflow.nodes);
        // Enqueue start nodes
        for (const node of startNodes) {
          await addNodeJob(node.type, {
            executionId,
            workflowId: input.workflowId,
            nodeId: node.id,
          });
        }
      }

      return { executionId };
    }),

  getExecution: baseProcedure
    .input(z.object({ executionId: z.string() }))
    .query(async ({ input }) => {
      return executionsService.getExecution(input.executionId);
    }),

  listExecutions: baseProcedure
    .input(ListExecutionsSchema)
    .query(async ({ input }) => {
      return executionsService.listExecutions(input.workflowId, {
        page: input.page,
        limit: input.limit,
      });
    }),

  cancelExecution: baseProcedure
    .input(z.object({ executionId: z.string() }))
    .mutation(async ({ input }) => {
      return executionsService.cancelExecution(input.executionId);
    }),

  // Trigger operations
  createTrigger: baseProcedure
    .input(CreateTriggerSchema)
    .mutation(async ({ input }) => {
      return triggersService.create(input);
    }),

  listTriggers: baseProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(async ({ input }) => {
      return triggersService.listByWorkflow(input.workflowId);
    }),

  toggleTrigger: baseProcedure
    .input(z.object({ triggerId: z.string() }))
    .mutation(async ({ input }) => {
      return triggersService.toggle(input.triggerId);
    }),

  deleteTrigger: baseProcedure
    .input(z.object({ triggerId: z.string() }))
    .mutation(async ({ input }) => {
      return triggersService.delete(input.triggerId);
    }),
});

export type WorkflowRouter = typeof workflowRouter;
