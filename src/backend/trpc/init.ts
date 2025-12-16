import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "@/backend/context";
import type { JwtPayload } from "@/backend/modules/shared/auth";

export const t = initTRPC.context<Context>().create();
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

/**
 * Role types
 */
export type Role = "admin" | "user" | "moderator" | string;

/**
 * Authorize roles helper - throws if user doesn't have required role
 * Usage: authorizeRoles(ctx.user, ["admin", "moderator"])
 */
export function authorizeRoles(
  user: JwtPayload | null,
  allowedRoles: Role[]
): asserts user is JwtPayload {
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  if (!allowedRoles.includes(user.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
    });
  }
}

/**
 * Protected procedure - requires valid session/user
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  authorizeRoles(ctx.user, ["admin"]);

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Create a role-based procedure
 * Usage: withRoles(["admin", "moderator"]).query(...)
 */
export function withRoles(allowedRoles: Role[]) {
  return t.procedure.use(async ({ ctx, next }) => {
    authorizeRoles(ctx.user, allowedRoles);

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });
}
