import { z } from "zod";

export const setSchema = z.object({
  values: z.array(z.object({ key: z.string(), value: z.string() })),
});

export type SetConfig = z.infer<typeof setSchema>;
