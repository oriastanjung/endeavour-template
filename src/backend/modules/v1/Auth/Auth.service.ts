import { TRPCError } from "@trpc/server";
import type {
  SignUpModel,
  SignInModel,
  AuthResponse,
  MeResponse,
} from "./Auth.entity";
import {
  JwtService,
  PasswordService,
  type JwtPayload,
} from "@/backend/modules/shared/auth";
import type { IUserRepository } from "../User/User.repository";
import type { ISessionRepository } from "../Session/Session.repository";
import { SessionService } from "../Session/Session.service";

export class AuthService implements IAuthServiceInterface {
  private jwtService = new JwtService();
  private passwordService = new PasswordService();
  private sessionService: SessionService;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository
  ) {
    this.sessionService = new SessionService(sessionRepository);
  }

  /**
   * Register a new user
   */
  async signUp(data: SignUpModel): Promise<{ message: string }> {
    // Check if email already exists
    const existingUser = await this.userRepository.getOneUserByEmail(
      data.email
    );
    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(data.password);

    // Create user
    await this.userRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return { message: "Account created successfully. Please sign in." };
  }

  /**
   * Sign in user - returns session ID (not tokens)
   */
  async signIn(
    data: SignInModel,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ sessionId: string; user: AuthResponse["user"] }> {
    // Find user by email
    const user = await this.userRepository.getOneUserByEmail(data.email);
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Account is deactivated. Please contact support.",
      });
    }

    // Verify password
    const isValidPassword = await this.passwordService.compare(
      data.password,
      user.password
    );
    if (!isValidPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    // Generate refresh token (stored in DB, NOT in cookie)
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    // Create session - returns session with ID
    const session = await this.sessionService.createSession(
      user.id,
      refreshToken,
      userAgent,
      ipAddress
    );

    return {
      sessionId: session.id, // Only return session ID (stored in cookie)
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  /**
   * Sign out user by session ID
   */
  async signOut(sessionId: string): Promise<{ message: string }> {
    try {
      await this.sessionRepository.deleteSession(sessionId);
    } catch {
      // Ignore errors - session might already be deleted
    }
    return { message: "Signed out successfully" };
  }

  /**
   * Sign out from all devices
   */
  async signOutAll(userId: string): Promise<{ message: string }> {
    await this.sessionService.deleteAllUserSessions(userId);
    return { message: "Signed out from all devices" };
  }

  /**
   * Validate session and generate access token
   * This is called on every protected request
   */
  async validateSession(sessionId: string): Promise<{
    user: JwtPayload;
    accessToken: string;
  } | null> {
    // Get session from DB
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await this.sessionRepository.deleteSession(sessionId);
      return null;
    }

    // Verify refresh token in session
    const payload = this.jwtService.verifyRefreshToken(session.refreshToken);
    if (!payload) {
      await this.sessionRepository.deleteSession(sessionId);
      return null;
    }

    // Check if user still exists and is active
    const user = await this.userRepository.getOneUserById(payload.userId);
    if (!user || !user.isActive) {
      await this.sessionRepository.deleteSession(sessionId);
      return null;
    }

    // Update last active timestamp
    await this.sessionService.updateActivity(sessionId);

    // Generate fresh access token for this request
    const accessToken = this.jwtService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
    };
  }

  /**
   * Get current user info
   */
  async me(userId: string): Promise<MeResponse> {
    const user = await this.userRepository.getOneUserByIdSafe(userId);
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }

  /**
   * Get all sessions for current user
   */
  async getSessions(userId: string) {
    return await this.sessionService.getUserSessions(userId);
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(
    userId: string,
    sessionId: string
  ): Promise<{ message: string }> {
    const sessions = await this.sessionService.getUserSessions(userId);
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Session not found",
      });
    }

    await this.sessionRepository.deleteSession(sessionId);
    return { message: "Session revoked successfully" };
  }
}

interface IAuthServiceInterface {
  signUp: (data: SignUpModel) => Promise<{ message: string }>;
  signIn: (
    data: SignInModel,
    userAgent?: string,
    ipAddress?: string
  ) => Promise<{ sessionId: string; user: AuthResponse["user"] }>;
  signOut: (sessionId: string) => Promise<{ message: string }>;
  signOutAll: (userId: string) => Promise<{ message: string }>;
  validateSession: (sessionId: string) => Promise<{
    user: JwtPayload;
    accessToken: string;
  } | null>;
  me: (userId: string) => Promise<MeResponse>;
  getSessions: (userId: string) => Promise<unknown[]>;
  revokeSession: (
    userId: string,
    sessionId: string
  ) => Promise<{ message: string }>;
}
