import type { IUserRepository } from "./User.repository";
import type { UserModel, SafeUserModel, CreateUserModel } from "./User.entity";
import type { PaginationWrapper } from "@/backend/dto/pagination";
import { PasswordService } from "@/backend/modules/shared/auth";
import { TRPCError } from "@trpc/server";

export class UserService implements IUserServiceInterface {
  private passwordService = new PasswordService();

  constructor(private readonly userRepository: IUserRepository) {}

  async getAllUsers(params: {
    page: number;
    limit: number;
    keyword?: string;
    sortBy: string;
    role?: string;
    isActive?: boolean;
  }) {
    return await this.userRepository.getAllUsers(params);
  }

  async getOneUserById(id: string): Promise<SafeUserModel> {
    const user = await this.userRepository.getOneUserByIdSafe(id);
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    return user;
  }

  async getOneUserByEmail(email: string): Promise<UserModel | null> {
    return await this.userRepository.getOneUserByEmail(email);
  }

  async createUser(data: CreateUserModel): Promise<SafeUserModel> {
    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(data.email);
    if (emailExists) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(data.password);

    const user = await this.userRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "user",
    });

    // Return safe user (without password)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUser(
    id: string,
    data: Partial<
      Omit<UserModel, "id" | "password" | "createdAt" | "updatedAt">
    >
  ): Promise<SafeUserModel> {
    // Check if user exists
    const existingUser = await this.userRepository.getOneUserById(id);
    if (!existingUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Check if email is being changed and already exists
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.userRepository.emailExists(data.email);
      if (emailExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already exists",
        });
      }
    }

    return await this.userRepository.updateUser(id, data);
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.getOneUserById(id);
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Verify old password
    const isValid = await this.passwordService.compare(
      oldPassword,
      user.password
    );
    if (!isValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid current password",
      });
    }

    // Hash and save new password
    const hashedPassword = await this.passwordService.hash(newPassword);
    await this.userRepository.updatePassword(id, hashedPassword);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.getOneUserById(id);
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    await this.userRepository.deleteUser(id);
  }
}

interface IUserServiceInterface {
  getAllUsers: (params: {
    page: number;
    limit: number;
    keyword?: string;
    sortBy: string;
    role?: string;
    isActive?: boolean;
  }) => Promise<PaginationWrapper<SafeUserModel[]>>;
  getOneUserById: (id: string) => Promise<SafeUserModel>;
  getOneUserByEmail: (email: string) => Promise<UserModel | null>;
  createUser: (data: CreateUserModel) => Promise<SafeUserModel>;
  updateUser: (
    id: string,
    data: Partial<
      Omit<UserModel, "id" | "password" | "createdAt" | "updatedAt">
    >
  ) => Promise<SafeUserModel>;
  changePassword: (
    id: string,
    oldPassword: string,
    newPassword: string
  ) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}
