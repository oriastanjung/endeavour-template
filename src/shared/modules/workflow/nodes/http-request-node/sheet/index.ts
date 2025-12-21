// src/shared/modules/workflow/nodes/http-request-node/sheet/index.ts
// HTTP Request Node - Config Schema

import { z } from "zod";

export const httpRequestSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
  url: z.string().min(1).describe("URL to request (supports templates)"),
  headers: z
    .record(z.string(), z.string())
    .default({ "Content-Type": "application/json" }),
  bodyTemplate: z
    .string()
    .default("")
    .describe("Request body (Handlebars template)"),
  timeoutMs: z.number().int().positive().default(15000),
  followRedirect: z.boolean().default(true),
});

export type HttpRequestConfig = z.infer<typeof httpRequestSchema>;

export const httpRequestDefaults: HttpRequestConfig = {
  method: "GET",
  url: "",
  headers: { "Content-Type": "application/json" },
  bodyTemplate: "",
  timeoutMs: 15000,
  followRedirect: true,
};
