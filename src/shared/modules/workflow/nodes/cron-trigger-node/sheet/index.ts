// src/shared/modules/workflow/nodes/cron-trigger-node/sheet/index.ts
// Cron Trigger Node - Config Schema

import { z } from "zod";

export const cronTriggerSchema = z.object({
  cronExpr: z.string().min(1).describe("Cron expression (e.g., */5 * * * *)"),
  timezone: z.string().default("UTC"),
  payload: z.record(z.string(), z.any()).default({}),
});

export type CronTriggerConfig = z.infer<typeof cronTriggerSchema>;

export const cronTriggerDefaults: CronTriggerConfig = {
  cronExpr: "0 * * * *", // Every hour
  timezone: "UTC",
  payload: {},
};
