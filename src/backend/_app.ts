import { createTRPCRouter } from "@/trpc/init";
import { HandShakeRouter } from "./modules/shared/handshake";
// START: INJECT MODULE ROUTER
import { BlogRouter } from "./modules/v1/Blog/Blog.route";
// END: INJECT MODULE ROUTER

export const appRouter = createTRPCRouter({
  handshake: new HandShakeRouter().generateRouter(),
  // START: INJECT MODULE ROUTER
  blog: new BlogRouter().generateRouter(),
  // END: INJECT MODULE ROUTER
});

export type AppRouter = typeof appRouter;
