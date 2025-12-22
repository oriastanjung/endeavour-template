import { z } from "zod";

export const mergeSchema = z.object({});

export type MergeConfig = z.infer<typeof mergeSchema>;
