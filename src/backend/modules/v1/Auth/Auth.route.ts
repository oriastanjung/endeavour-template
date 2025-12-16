import {
  authorizeRoles,
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/backend/trpc/init";
import { SignUpSchema, SignInSchema } from "./Auth.entity";
import { CookieService } from "@/backend/modules/shared/auth";
import { z } from "zod";

export class AuthRouter {
  private cookieService = new CookieService();

  generateRouter() {
    return createTRPCRouter({
      // Public: Sign up
      signUp: baseProcedure
        .input(SignUpSchema)
        .mutation(async ({ input, ctx }) => {
          return await ctx.container.authService.signUp(input);
        }),

      // Public: Sign in
      signIn: baseProcedure
        .input(SignInSchema)
        .mutation(async ({ input, ctx }) => {
          const userAgent = ctx.headers?.get("user-agent") || undefined;
          const ipAddress =
            ctx.headers?.get("x-forwarded-for")?.split(",")[0] ||
            ctx.headers?.get("x-real-ip") ||
            undefined;

          const result = await ctx.container.authService.signIn(
            input,
            userAgent,
            ipAddress
          );

          // Set ONLY session ID in cookie (not tokens!)
          await this.cookieService.setSessionId(result.sessionId);

          return {
            user: result.user,
          };
        }),

      // Protected: Get current user
      me: protectedProcedure.query(async ({ ctx }) => {
        authorizeRoles(ctx.user!, ["user", "admin"]);
        return await ctx.container.authService.me(ctx.user!.userId);
      }),

      // Protected: Sign out (current session)
      signOut: protectedProcedure.mutation(async ({ ctx }) => {
        const sessionId = await this.cookieService.getSessionId();

        if (sessionId) {
          await ctx.container.authService.signOut(sessionId);
        }

        // Clear session cookie
        await this.cookieService.clearSession();

        return { message: "Signed out successfully" };
      }),

      // Protected: Sign out from all devices
      signOutAll: protectedProcedure.mutation(async ({ ctx }) => {
        const result = await ctx.container.authService.signOutAll(
          ctx.user!.userId
        );

        // Clear current cookie
        await this.cookieService.clearSession();

        return result;
      }),

      // Protected: Get all sessions
      getSessions: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.container.authService.getSessions(ctx.user!.userId);
      }),

      // Protected: Revoke a specific session
      revokeSession: protectedProcedure
        .input(z.object({ sessionId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
          return await ctx.container.authService.revokeSession(
            ctx.user!.userId,
            input.sessionId
          );
        }),

      // Protected: Set session online (called when tab is focused)
      setOnline: protectedProcedure.mutation(async ({ ctx }) => {
        const sessionId = ctx.sessionId;
        if (sessionId) {
          await ctx.container.sessionRepository.updateLastActive(sessionId);
        }
        return { status: "online" };
      }),

      // Protected: Set session offline (called when tab loses focus or closes)
      setOffline: protectedProcedure.mutation(async ({ ctx }) => {
        const sessionId = ctx.sessionId;
        if (sessionId) {
          await ctx.container.sessionRepository.setOffline(sessionId);
        }
        return { status: "offline" };
      }),
    });
  }
}
