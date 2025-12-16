import { z } from "zod";

// START SCHEMA

export const SignUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpModel = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInModel = z.infer<typeof SignInSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export type RefreshTokenModel = z.infer<typeof RefreshTokenSchema>;

// Response types
export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
  };
  accessToken: string;
}

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
  emailVerified: Date | null;
  createdAt: Date;
}

// END SCHEMA
