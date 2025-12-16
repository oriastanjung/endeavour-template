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
