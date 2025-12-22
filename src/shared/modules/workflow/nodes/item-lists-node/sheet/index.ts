import { z } from "zod";

export const itemListsSchema = z.object({
  operation: z.enum(["split", "sort", "limit", "aggregate"]).default("limit"),
  field: z.string().optional(), // field containing the list (if empty, assumes root state is list?)
  limit: z.coerce.number().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),
});

export type ItemListsConfig = z.infer<typeof itemListsSchema>;
