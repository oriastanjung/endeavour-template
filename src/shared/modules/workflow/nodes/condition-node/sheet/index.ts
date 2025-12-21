// src/shared/modules/workflow/nodes/condition-node/sheet/index.ts
// Condition Node - Config Schema

import { z } from "zod";

export const conditionSchema = z.object({
  // Handlebars boolean expression
  expression: z.string().min(1).describe("Boolean expression to evaluate"),
  // Edge labels for routing
  trueLabel: z.string().default("true"),
  falseLabel: z.string().default("false"),
});

export type ConditionConfig = z.infer<typeof conditionSchema>;

export const conditionDefaults: ConditionConfig = {
  expression: "{{#if (eq state.value true)}}true{{else}}false{{/if}}",
  trueLabel: "true",
  falseLabel: "false",
};
