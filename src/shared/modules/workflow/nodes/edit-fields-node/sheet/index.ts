import { z } from "zod";

export const editFieldsSchema = z.object({
  mode: z.enum(["append", "keep_only"]).default("append"),
  fields: z.array(z.object({ key: z.string(), value: z.string() })),
});

export type EditFieldsConfig = z.infer<typeof editFieldsSchema>;
