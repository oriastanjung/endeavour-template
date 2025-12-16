import { z } from "zod";
import { User } from "@prisma/client";

// START SCHEMA

export type UserModel = User;

// Safe user without password
export type SafeUserModel = Omit<User, "password">;

export const GetAllUserSchema = z.object({
  page: z.number(),
  limit: z.number(),
  keyword: z.string().optional(),
  sortBy: z.enum(["latest", "oldest"]).default("latest"),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const CreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().default("user"),
});

export type CreateUserModel = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().nullable().optional(),
});

export type UpdateUserModel = z.infer<typeof UpdateUserSchema>;

export const ChangePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type ChangePasswordModel = z.infer<typeof ChangePasswordSchema>;
// END SCHEMA
