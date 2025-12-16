import type { ISessionRepository } from "./Session.repository";
import type {
  SessionModel,
  CreateSessionModel,
  DeviceType,
} from "./Session.entity";
import { JWT_REFRESH_EXPIRES_MS } from "@/config";

export class SessionService implements ISessionServiceInterface {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  /**
   * Create a new session with device info parsed from user agent
   */
  async createSession(
    userId: string,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<SessionModel> {
    const { deviceName, deviceType, browser } = this.parseUserAgent(
      userAgent || ""
    );

    const sessionData: CreateSessionModel = {
      userId,
      refreshToken,
      userAgent,
      ipAddress,
      deviceName,
      deviceType,
      browser,
      expiresAt: new Date(Date.now() + JWT_REFRESH_EXPIRES_MS),
    };

    return await this.sessionRepository.createSession(sessionData);
  }

  /**
   * Get session by refresh token
   */
  async getByRefreshToken(refreshToken: string): Promise<SessionModel | null> {
    const session = await this.sessionRepository.findByRefreshToken(
      refreshToken
    );

    // Check if session is expired
    if (session && session.expiresAt < new Date()) {
      await this.sessionRepository.deleteSession(session.id);
      return null;
    }

    return session;
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionModel[]> {
    return await this.sessionRepository.findByUserId(userId);
  }

  /**
   * Update session activity
   */
  async updateActivity(sessionId: string): Promise<void> {
    await this.sessionRepository.updateLastActive(sessionId);
  }

  /**
   * Mark session as offline
   */
  async markOffline(sessionId: string): Promise<void> {
    await this.sessionRepository.setOffline(sessionId);
  }

  /**
   * Rotate refresh token (for security)
   */
  async rotateToken(
    oldToken: string,
    newToken: string
  ): Promise<SessionModel | null> {
    const newExpiresAt = new Date(Date.now() + JWT_REFRESH_EXPIRES_MS);
    return await this.sessionRepository.rotateRefreshToken(
      oldToken,
      newToken,
      newExpiresAt
    );
  }

  /**
   * Delete a specific session (logout from device)
   */
  async deleteSession(refreshToken: string): Promise<void> {
    await this.sessionRepository.deleteByRefreshToken(refreshToken);
  }

  /**
   * Delete all user sessions (logout from all devices)
   */
  async deleteAllUserSessions(userId: string): Promise<void> {
    await this.sessionRepository.deleteAllUserSessions(userId);
  }

  /**
   * Clean up expired sessions (can be called by cron job)
   */
  async cleanupExpiredSessions(): Promise<number> {
    return await this.sessionRepository.deleteExpiredSessions();
  }

  /**
   * Parse user agent to extract device and browser info
   */
  private parseUserAgent(userAgent: string): {
    deviceName: string | undefined;
    deviceType: DeviceType | undefined;
    browser: string | undefined;
  } {
    let deviceName: string | undefined;
    let deviceType: DeviceType | undefined;
    let browser: string | undefined;

    const ua = userAgent.toLowerCase();

    // Detect device type and name
    if (ua.includes("iphone")) {
      deviceType = "mobile";
      deviceName = "iPhone";
    } else if (ua.includes("ipad")) {
      deviceType = "tablet";
      deviceName = "iPad";
    } else if (ua.includes("android")) {
      if (ua.includes("mobile")) {
        deviceType = "mobile";
        deviceName = "Android Phone";
      } else {
        deviceType = "tablet";
        deviceName = "Android Tablet";
      }
    } else if (ua.includes("windows")) {
      deviceType = "desktop";
      deviceName = "Windows PC";
    } else if (ua.includes("macintosh") || ua.includes("mac os")) {
      deviceType = "desktop";
      deviceName = "Mac";
    } else if (ua.includes("linux")) {
      deviceType = "desktop";
      deviceName = "Linux PC";
    }

    // Detect browser
    if (ua.includes("chrome") && !ua.includes("edg")) {
      const match = userAgent.match(/Chrome\/(\d+)/i);
      browser = match ? `Chrome ${match[1]}` : "Chrome";
    } else if (ua.includes("firefox")) {
      const match = userAgent.match(/Firefox\/(\d+)/i);
      browser = match ? `Firefox ${match[1]}` : "Firefox";
    } else if (ua.includes("safari") && !ua.includes("chrome")) {
      const match = userAgent.match(/Version\/(\d+)/i);
      browser = match ? `Safari ${match[1]}` : "Safari";
    } else if (ua.includes("edg")) {
      const match = userAgent.match(/Edg\/(\d+)/i);
      browser = match ? `Edge ${match[1]}` : "Edge";
    } else if (ua.includes("opera") || ua.includes("opr")) {
      browser = "Opera";
    }

    return { deviceName, deviceType, browser };
  }
}

interface ISessionServiceInterface {
  createSession: (
    userId: string,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string
  ) => Promise<SessionModel>;
  getByRefreshToken: (refreshToken: string) => Promise<SessionModel | null>;
  getUserSessions: (userId: string) => Promise<SessionModel[]>;
  updateActivity: (sessionId: string) => Promise<void>;
  markOffline: (sessionId: string) => Promise<void>;
  rotateToken: (
    oldToken: string,
    newToken: string
  ) => Promise<SessionModel | null>;
  deleteSession: (refreshToken: string) => Promise<void>;
  deleteAllUserSessions: (userId: string) => Promise<void>;
  cleanupExpiredSessions: () => Promise<number>;
}
