import { cookies } from "next/headers";

export const SESSION_ID_COOKIE = "session_id";

// Session cookie lasts as long as the session in DB (7 days)
const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export class CookieService {
  /**
   * Set session ID in HTTP-only cookie
   * This is the ONLY thing stored in cookie - just an opaque session ID
   */
  async setSessionId(sessionId: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_ID_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  /**
   * Get session ID from cookie
   */
  async getSessionId(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_ID_COOKIE)?.value ?? null;
  }

  /**
   * Clear session cookie (logout)
   */
  async clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_ID_COOKIE);
  }
}
