import { headers } from "next/headers";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { Container, container } from "./containers/container";

export type Context = { token: string | null; container: Container };

// Helper to extract token and create context
function buildContext(authHeader: string | null): Context {
  let token: string | null = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }
  return { token, container };
}

// Zero-arg context creator for RSC/createCallerFactory
export async function createTRPCContext(): Promise<Context> {
  const h = await headers();
  const authHeader = h.get("authorization");
  return buildContext(authHeader);
}

// Fetch adapter context creator for /api/trpc routes
export function createTRPCContextFromFetch({
  req,
}: FetchCreateContextFnOptions): Context {
  const authHeader = req?.headers?.get("authorization");
  return buildContext(authHeader);
}
