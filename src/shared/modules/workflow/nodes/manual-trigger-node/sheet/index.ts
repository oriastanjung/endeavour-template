// src/shared/modules/workflow/nodes/manual-trigger-node/sheet/index.ts
// Manual Trigger Node - Config Schema

import { z } from "zod";

export const manualTriggerSchema = z.object({
  payload: z.record(z.string(), z.any()).default({}), // optional initial data
});

export type ManualTriggerConfig = z.infer<typeof manualTriggerSchema>;

export const manualTriggerDefaults: ManualTriggerConfig = {
  payload: {},
};
