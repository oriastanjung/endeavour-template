import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import {
  CreateBlogSchema,
  GetAllBlogSchema,
  UpdateBlogSchema,
  type CreateBlogModel,
} from "./Blog.entity";
import { z } from "zod";

export class BlogRouter {
  generateRouter() {
    return createTRPCRouter({
      getAllBlogs: baseProcedure
        .input(GetAllBlogSchema)
        .query(async ({ input, ctx }) => {
          return await ctx.container.blogService.getAllBlogs(input);
        }),
      getOneBlogById: baseProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
          return await ctx.container.blogService.getOneBlogById(input.id);
        }),
      createBlog: baseProcedure
        .input(CreateBlogSchema)
        .mutation(async ({ input, ctx }) => {
          const inputData: CreateBlogModel = {
            name: input.name,
          };
          return await ctx.container.blogService.createBlog(inputData);
        }),
      updateBlog: baseProcedure
        .input(UpdateBlogSchema)
        .mutation(async ({ input, ctx }) => {
          return await ctx.container.blogService.updateBlog(input.id, input);
        }),
      deleteBlog: baseProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
          return await ctx.container.blogService.deleteBlog(input.id);
        }),
    });
  }
}
