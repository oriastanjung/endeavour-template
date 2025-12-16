import type { IBlogRepository } from "./Blog.repository";
import type { BlogModel } from "./Blog.entity";
import type { PaginationWrapper } from "@/backend/dto/pagination";
import { Prisma } from "@prisma/client";

export class BlogService implements IBlogServiceInterface {
  constructor(private readonly blogRepository: IBlogRepository) {}

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
  }) {
    return await this.blogRepository.getAllBlogs({
      page,
      limit,
      keyword,
      sortBy,
    });
  }

  async getOneBlogById(id: string) {
    return await this.blogRepository.getOneBlogById(id);
  }

  async createBlog(blog: Prisma.BlogCreateInput) {
    return await this.blogRepository.createBlog(blog);
  }

  async updateBlog(id: string, blog: Prisma.BlogUpdateInput) {
    return await this.blogRepository.updateBlog(id, blog);
  }

  async deleteBlog(id: string) {
    return await this.blogRepository.deleteBlog(id);
  }
}

interface IBlogServiceInterface {
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
  createBlog: (
    blog: Prisma.BlogCreateInput
  ) => Promise<BlogModel>;
  updateBlog: (
    id: string,
    blog: Prisma.BlogUpdateInput
  ) => Promise<BlogModel>;
  deleteBlog: (id: string) => Promise<void>;
}
