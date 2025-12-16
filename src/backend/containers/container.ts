import { db } from "@/shared/database";
import { HandShakeService } from "../modules/shared/handshake";
// START: INJECT MODULE SERVICE
import { BlogService } from "../modules/v1/Blog/Blog.service";
// END: INJECT MODULE SERVICE

// START: INJECT MODULE REPOSITORY
import { BlogRepository } from "../modules/v1/Blog/Blog.repository";
// END: INJECT MODULE REPOSITORY

// Repository should be singletons
export const singletons = {
  db: db,
  // START: INJECT MODULE REPOSITORY
  blogRepository: new BlogRepository(),
  // END: INJECT MODULE REPOSITORY
};

export const container = {
  handshakeService: new HandShakeService(),
  // START: INJECT MODULE SERVICE
  blogService: new BlogService(singletons.blogRepository),
  // END: INJECT MODULE SERVICE

  ...singletons,
};

export type Container = typeof container;
