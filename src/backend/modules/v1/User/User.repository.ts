import { Prisma } from "@prisma/client";
import { db } from "@/shared/database";
import type { PaginationWrapper } from "@/backend/dto/pagination";
import type { UserModel, SafeUserModel } from "./User.entity";

export class UserRepository implements IUserRepository {
  /**
   * Get paginated users with filters
   */
  async getAllUsers({
    page,
    limit,
    keyword,
    sortBy,
    role,
    isActive,
  }: {
    page: number;
    limit: number;
    keyword?: string;
    sortBy: string;
    role?: string;
    isActive?: boolean;
  }): Promise<PaginationWrapper<SafeUserModel[]>> {
    const whereConditions: Prisma.UserWhereInput = {};

    if (keyword) {
      whereConditions.OR = [
        { name: { contains: keyword, mode: "insensitive" } },
        { email: { contains: keyword, mode: "insensitive" } },
      ];
    }

    if (role) {
      whereConditions.role = role;
    }

    if (isActive !== undefined) {
      whereConditions.isActive = isActive;
    }

    const total_items = await db.user.count({
      where: whereConditions,
    });

    const allData = await db.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereConditions,
      orderBy: {
        createdAt: sortBy === "oldest" ? "asc" : "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      data: allData as SafeUserModel[],
      total_pages: Math.ceil(total_items / limit),
      current_page: page,
      per_page: limit,
      total_items,
    };
  }

  /**
   * Get user by ID (with password for internal use)
   */
  async getOneUserById(id: string): Promise<UserModel | null> {
    return await db.user.findUnique({
      where: { id },
    });
  }

  /**
   * Get user by ID (safe, without password)
   */
  async getOneUserByIdSafe(id: string): Promise<SafeUserModel | null> {
    return await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get user by email (with password for auth)
   */
  async getOneUserByEmail(email: string): Promise<UserModel | null> {
    return await db.user.findUnique({
      where: { email },
    });
  }

  /**
   * Create new user
   */
  async createUser(user: Prisma.UserCreateInput): Promise<UserModel> {
    return await db.user.create({
      data: user,
    });
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    user: Prisma.UserUpdateInput
  ): Promise<SafeUserModel> {
    return await db.user.update({
      where: { id },
      data: user,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await db.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await db.user.delete({
      where: { id },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await db.user.count({
      where: { email },
    });
    return count > 0;
  }
}

export interface IUserRepository {
  getAllUsers: (params: {
    page: number;
    limit: number;
    keyword?: string;
    sortBy: string;
    role?: string;
    isActive?: boolean;
  }) => Promise<PaginationWrapper<SafeUserModel[]>>;
  getOneUserById: (id: string) => Promise<UserModel | null>;
  getOneUserByIdSafe: (id: string) => Promise<SafeUserModel | null>;
  getOneUserByEmail: (email: string) => Promise<UserModel | null>;
  createUser: (user: Prisma.UserCreateInput) => Promise<UserModel>;
  updateUser: (
    id: string,
    user: Prisma.UserUpdateInput
  ) => Promise<SafeUserModel>;
  updatePassword: (id: string, hashedPassword: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  emailExists: (email: string) => Promise<boolean>;
}
