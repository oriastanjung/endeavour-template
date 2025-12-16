import { z } from "zod";
import { Session } from "@prisma/client";

// START SCHEMA

export type SessionModel = Session;

export const CreateSessionSchema = z.object({
  userId: z.string().uuid(),
  refreshToken: z.string(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  deviceName: z.string().optional(),
  deviceType: z.enum(["mobile", "tablet", "desktop"]).optional(),
  browser: z.string().optional(),
  expiresAt: z.date(),
});

export type CreateSessionModel = z.infer<typeof CreateSessionSchema>;

// Device type enum
export type DeviceType = "mobile" | "tablet" | "desktop";

// END SCHEMA
