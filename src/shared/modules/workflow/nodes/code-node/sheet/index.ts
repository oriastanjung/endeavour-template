import { z } from "zod";

export const codeSchema = z.object({
  code: z.string().default("return {}"),
});

export type CodeConfig = z.infer<typeof codeSchema>;
