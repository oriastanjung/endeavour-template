import { db } from "@/shared/database";
import { HandShakeService } from "../modules/shared/handshake";
// START: INJECT MODULE SERVICE
import { BlogService } from "../modules/v1/Blog/Blog.service";
import { UserService } from "../modules/v1/User/User.service";
import { SessionService } from "../modules/v1/Session/Session.service";
import { AuthService } from "../modules/v1/Auth/Auth.service";
// END: INJECT MODULE SERVICE

// START: INJECT MODULE REPOSITORY
import { BlogRepository } from "../modules/v1/Blog/Blog.repository";
import { UserRepository } from "../modules/v1/User/User.repository";
import { SessionRepository } from "../modules/v1/Session/Session.repository";
// END: INJECT MODULE REPOSITORY

// Repository should be singletons
export const singletons = {
  db: db,
  // START: INJECT MODULE REPOSITORY
  blogRepository: new BlogRepository(),
  userRepository: new UserRepository(),
  sessionRepository: new SessionRepository(),
  // END: INJECT MODULE REPOSITORY
};

export const container = {
  handshakeService: new HandShakeService(),
  // START: INJECT MODULE SERVICE
  blogService: new BlogService(singletons.blogRepository),
  userService: new UserService(singletons.userRepository),
  sessionService: new SessionService(singletons.sessionRepository),
  authService: new AuthService(
    singletons.userRepository,
    singletons.sessionRepository
  ),
  // END: INJECT MODULE SERVICE

  ...singletons,
};

export type Container = typeof container;
