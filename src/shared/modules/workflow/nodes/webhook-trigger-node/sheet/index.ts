import { z } from "zod";

export const webhookTriggerSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("POST"),
  // Array of headers that must match
  requiredHeaders: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.string().min(1),
      })
    )
    .optional()
    .default([]),
  // Array of body properties that must match (for POST/PUT)
  requiredPayload: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.string().min(1),
      })
    )
    .optional()
    .default([]),
});

export type WebhookTriggerConfig = z.infer<typeof webhookTriggerSchema>;
