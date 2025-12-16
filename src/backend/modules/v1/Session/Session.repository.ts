import { db } from "@/shared/database";
import type { SessionModel, CreateSessionModel } from "./Session.entity";

export class SessionRepository implements ISessionRepository {
  /**
   * Create a new session
   */
  async createSession(data: CreateSessionModel): Promise<SessionModel> {
    return await db.session.create({
      data: {
        userId: data.userId,
        refreshToken: data.refreshToken,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        deviceName: data.deviceName,
        deviceType: data.deviceType,
        browser: data.browser,
        expiresAt: data.expiresAt,
        lastActiveAt: new Date(),
        isOnline: true,
      },
    });
  }

  /**
   * Find session by ID
   */
  async findById(id: string): Promise<SessionModel | null> {
    return await db.session.findUnique({
      where: { id },
    });
  }

  /**
   * Find session by refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<SessionModel | null> {
    return await db.session.findUnique({
      where: { refreshToken },
    });
  }

  /**
   * Find all sessions for a user
   */
  async findByUserId(userId: string): Promise<SessionModel[]> {
    return await db.session.findMany({
      where: { userId },
      orderBy: { lastActiveAt: "desc" },
    });
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(id: string): Promise<void> {
    await db.session.update({
      where: { id },
      data: {
        lastActiveAt: new Date(),
        isOnline: true,
      },
    });
  }

  /**
   * Set session offline
   */
  async setOffline(id: string): Promise<void> {
    await db.session.update({
      where: { id },
      data: {
        isOnline: false,
        lastOfflineAt: new Date(),
      },
    });
  }

  /**
   * Delete session by ID
   */
  async deleteSession(id: string): Promise<void> {
    await db.session.delete({
      where: { id },
    });
  }

  /**
   * Delete session by refresh token
   */
  async deleteByRefreshToken(refreshToken: string): Promise<void> {
    await db.session.delete({
      where: { refreshToken },
    });
  }

  /**
   * Delete all sessions for a user
   */
  async deleteAllUserSessions(userId: string): Promise<void> {
    await db.session.deleteMany({
      where: { userId },
    });
  }

  /**
   * Delete expired sessions
   */
  async deleteExpiredSessions(): Promise<number> {
    const result = await db.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }

  /**
   * Update session with new refresh token (rotation)
   */
  async rotateRefreshToken(
    oldToken: string,
    newToken: string,
    newExpiresAt: Date
  ): Promise<SessionModel | null> {
    try {
      return await db.session.update({
        where: { refreshToken: oldToken },
        data: {
          refreshToken: newToken,
          expiresAt: newExpiresAt,
          lastActiveAt: new Date(),
        },
      });
    } catch {
      return null;
    }
  }
}

export interface ISessionRepository {
  createSession: (data: CreateSessionModel) => Promise<SessionModel>;
  findById: (id: string) => Promise<SessionModel | null>;
  findByRefreshToken: (refreshToken: string) => Promise<SessionModel | null>;
  findByUserId: (userId: string) => Promise<SessionModel[]>;
  updateLastActive: (id: string) => Promise<void>;
  setOffline: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  deleteByRefreshToken: (refreshToken: string) => Promise<void>;
  deleteAllUserSessions: (userId: string) => Promise<void>;
  deleteExpiredSessions: () => Promise<number>;
  rotateRefreshToken: (
    oldToken: string,
    newToken: string,
    newExpiresAt: Date
  ) => Promise<SessionModel | null>;
}
