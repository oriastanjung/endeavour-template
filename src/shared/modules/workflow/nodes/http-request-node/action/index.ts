// src/shared/modules/workflow/nodes/http-request-node/action/index.ts
// HTTP Request Node - Action

import type { NodeAction } from "../../../backend/types";

export const httpRequestAction: NodeAction = async (input, ctx) => {
  const config = input as {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    bodyTemplate?: string;
    timeoutMs?: number;
    followRedirect?: boolean;
  };

  const method = config.method ?? "GET";
  const url = ctx.render(config.url ?? "");
  const headers = config.headers ?? { "Content-Type": "application/json" };
  const bodyTemplate = config.bodyTemplate ?? "";
  const timeoutMs = config.timeoutMs ?? 15000;
  const followRedirect = config.followRedirect ?? true;

  // Render body template if provided
  const body = bodyTemplate ? ctx.render(bodyTemplate) : undefined;

  await ctx.log("info", "HTTP request starting", { method, url });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: ["GET", "DELETE", "HEAD"].includes(method) ? undefined : body,
      redirect: followRedirect ? "follow" : "manual",
      signal: controller.signal,
    });

    const contentType = response.headers.get("Content-Type") || "";
    let responseBody: unknown;

    if (contentType.includes("application/json")) {
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }
    } else {
      responseBody = await response.text();
    }

    const result = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
    };

    await ctx.log("info", "HTTP request completed", {
      status: response.status,
    });

    return {
      output: result,
      nextEdgeLabel: undefined,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await ctx.log("error", "HTTP request failed", { message });
    throw error;
  } finally {
    clearTimeout(timer);
  }
};
