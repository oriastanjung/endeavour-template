import { Prisma } from "@prisma/client";
import { db } from "@/shared/database";
import type { PaginationWrapper } from "@/backend/dto/pagination";
import type { BlogModel } from "./Blog.entity";

export class BlogRepository implements IBlogRepository {
  async getAllBlogs({
    page,
    limit,
    keyword,
    sortBy,
  }: {
    page: number;
    limit: number;
    keyword: string;
    sortBy: string;
  }): Promise<PaginationWrapper<BlogModel[]>> {
    const whereConditions: Prisma.BlogWhereInput = {};

    // Add keyword search conditions
    if (keyword) {
      whereConditions.OR = [
        { name: { contains: keyword, mode: "insensitive" } },
      ];
    }

    // Count total items for pagination
    const total_items = await db.blog.count({
      where: whereConditions,
    });

    // Fetch paginated data
    const allData = await db.blog.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereConditions,
      orderBy: {
        createdAt: sortBy === "oldest" ? "asc" : "desc",
      },
    });

    return {
      data: allData,
      total_pages: Math.ceil(total_items / limit),
      current_page: page,
      per_page: limit,
      total_items,
    };
  }

  async getOneBlogById(id: string): Promise<BlogModel> {
    const blog = await db.blog.findUnique({
      where: { id },
    });
    if (!blog) {
      throw new Error("Blog not found");
    }
    return blog;
  }

  async createBlog(
    blog: Prisma.BlogCreateInput
  ): Promise<BlogModel> {
    const response = await db.blog.create({
      data: blog,
    });
    return response;
  }

  async updateBlog(
    id: string,
    blog: Prisma.BlogUpdateInput
  ): Promise<BlogModel> {
    const response = await db.blog.update({
      where: { id },
      data: blog,
    });
    return response;
  }

  async deleteBlog(id: string): Promise<void> {
    await db.blog.delete({
      where: { id },
    });
  }
}

export interface IBlogRepository {
  getAllBlogs: ({
    page,
    limit,
    keyword,
    sortBy,
  }: {
    page: number;
    limit: number;
    keyword: string;
    sortBy: string;
  }) => Promise<PaginationWrapper<BlogModel[]>>;
  getOneBlogById: (id: string) => Promise<BlogModel>;
  createBlog: (blog: Prisma.BlogCreateInput) => Promise<BlogModel>;
  updateBlog: (
    id: string,
    blog: Prisma.BlogUpdateInput
  ) => Promise<BlogModel>;
  deleteBlog: (id: string) => Promise<void>;
}
