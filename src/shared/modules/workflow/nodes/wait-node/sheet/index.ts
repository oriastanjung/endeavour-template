import { z } from "zod";

export const waitSchema = z.object({
  duration: z.coerce.number().min(0).default(5),
  unit: z.enum(["seconds", "minutes", "hours"]).default("seconds"),
});

export type WaitConfig = z.infer<typeof waitSchema>;
