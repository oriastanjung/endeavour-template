import { headers } from "next/headers";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { Container, container } from "./containers/container";
import type { JwtPayload } from "./modules/shared/auth";
import { SESSION_ID_COOKIE } from "./modules/shared/auth";

export type Context = {
  sessionId: string | null;
  user: JwtPayload | null;
  headers: Headers | null;
  container: Container;
};

/**
 * Parse cookie value from cookie header string
 */
function parseCookie(
  cookieHeader: string | null,
  name: string
): string | undefined {
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return undefined;
}

/**
 * Build context - validates session and gets user
 * Access token is generated fresh on each request if session is valid
 */
async function buildContextAsync(
  sessionId: string | null,
  reqHeaders: Headers | null
): Promise<Context> {
  let user: JwtPayload | null = null;

  if (sessionId) {
    // Validate session and get user from session
    const result = await container.authService.validateSession(sessionId);
    if (result) {
      user = result.user;
    }
  }

  return {
    sessionId,
    user,
    headers: reqHeaders,
    container,
  };
}

// Zero-arg context creator for RSC/createCallerFactory
export async function createTRPCContext(): Promise<Context> {
  const h = await headers();
  const cookieHeader = h.get("cookie");
  const sessionId = parseCookie(cookieHeader, SESSION_ID_COOKIE) ?? null;

  return await buildContextAsync(sessionId, h);
}

// Fetch adapter context creator for /api/trpc routes
export async function createTRPCContextFromFetch({
  req,
}: FetchCreateContextFnOptions): Promise<Context> {
  const cookieHeader = req?.headers?.get("cookie");
  const sessionId = parseCookie(cookieHeader, SESSION_ID_COOKIE) ?? null;

  return await buildContextAsync(sessionId, req?.headers ?? null);
}
