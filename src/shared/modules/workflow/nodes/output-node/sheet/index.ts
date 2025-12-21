// src/shared/modules/workflow/nodes/output-node/sheet/index.ts
// Output Node - Config Schema

import { z } from "zod";

export const outputSchema = z.object({
  key: z.string().default("result").describe("Key to store the output under"),
  expression: z
    .string()
    .default("{{json state}}")
    .describe("Handlebars expression for output value"),
});

export type OutputConfig = z.infer<typeof outputSchema>;

export const outputDefaults: OutputConfig = {
  key: "result",
  expression: "{{json state}}",
};
