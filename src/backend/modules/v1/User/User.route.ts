import { createTRPCRouter } from "@/trpc/init";
import { protectedProcedure, adminProcedure } from "@/trpc/init";
import {
  GetAllUserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  ChangePasswordSchema,
} from "./User.entity";
import { z } from "zod";

export class UserRouter {
  generateRouter() {
    return createTRPCRouter({
      // Admin only: Get all users
      getAllUsers: adminProcedure
        .input(GetAllUserSchema)
        .query(async ({ input, ctx }) => {
          return await ctx.container.userService.getAllUsers(input);
        }),

      // Admin only: Get one user by ID
      getOneUserById: adminProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
          return await ctx.container.userService.getOneUserById(input.id);
        }),

      // Admin only: Create user
      createUser: adminProcedure
        .input(CreateUserSchema)
        .mutation(async ({ input, ctx }) => {
          return await ctx.container.userService.createUser(input);
        }),

      // Admin only: Update user
      updateUser: adminProcedure
        .input(UpdateUserSchema)
        .mutation(async ({ input, ctx }) => {
          const { id, ...data } = input;
          return await ctx.container.userService.updateUser(id, data);
        }),

      // Protected: Change own password
      changePassword: protectedProcedure
        .input(ChangePasswordSchema)
        .mutation(async ({ input, ctx }) => {
          await ctx.container.userService.changePassword(
            ctx.user!.userId,
            input.oldPassword,
            input.newPassword
          );
          return { success: true };
        }),

      // Admin only: Delete user
      deleteUser: adminProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
          await ctx.container.userService.deleteUser(input.id);
          return { success: true };
        }),
    });
  }
}
