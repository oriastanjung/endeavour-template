export const DATABASE_URL = process.env.DATABASE_URL;
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// JWT Configuration
export const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
export const JWT_ACCESS_EXPIRES = "15m"; // 15 minutes
export const JWT_REFRESH_EXPIRES = "7d"; // 7 days
export const JWT_ACCESS_EXPIRES_MS = (1 / 2) * 60 * 1000; // 15 minutes in ms
export const JWT_REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export const BULLMQ_CONFIG = {
  REDIS_QUEUE_NAME: process.env.REDIS_QUEUE_NAME || "test",
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: process.env.REDIS_PORT || "6379",
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
};

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
