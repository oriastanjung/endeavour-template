import { z } from "zod";
import { Blog } from "@prisma/client";

// START SCHEMA

export type BlogModel = Blog;

export const GetAllBlogSchema = z.object({
  page: z.number(),
  limit: z.number(),
  keyword: z.string(),
  sortBy: z.enum(["latest", "oldest"]),
});

export const CreateBlogSchema = z.object({
  name: z.string(),
});

export type CreateBlogModel = z.infer<typeof CreateBlogSchema>;

export const UpdateBlogSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type UpdateBlogModel = z.infer<typeof UpdateBlogSchema>;
// END SCHEMA
