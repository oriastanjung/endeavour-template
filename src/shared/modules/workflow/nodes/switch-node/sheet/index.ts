import { z } from "zod";

export const switchSchema = z.object({
  conditions: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      expression: z.string(),
    })
  ),
});

export type SwitchConfig = z.infer<typeof switchSchema>;
