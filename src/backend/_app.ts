import { createTRPCRouter } from "@/trpc/init";
import { HandShakeRouter } from "./modules/shared/handshake";
// START: INJECT MODULE ROUTER
import { BlogRouter } from "./modules/v1/Blog/Blog.route";
import { UserRouter } from "./modules/v1/User/User.route";
import { AuthRouter } from "./modules/v1/Auth/Auth.route";
// END: INJECT MODULE ROUTER

export const appRouter = createTRPCRouter({
  handshake: new HandShakeRouter().generateRouter(),
  // START: INJECT MODULE ROUTER
  blog: new BlogRouter().generateRouter(),
  user: new UserRouter().generateRouter(),
  auth: new AuthRouter().generateRouter(),
  // END: INJECT MODULE ROUTER
});

export type AppRouter = typeof appRouter;
