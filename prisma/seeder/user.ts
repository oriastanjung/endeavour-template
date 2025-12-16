import { createLogger } from "@/shared/logger";
import { db } from "@/shared/database";
import { AuthService } from "@/backend/modules/v1/Auth/Auth.service";
import { UserRepository } from "@/backend/modules/v1/User/User.repository";
import { SessionRepository } from "@/backend/modules/v1/Session/Session.repository";
const logger = createLogger("UserSeeder");

async function userSeeds() {
  const isExist = await db.user.count();
  if (isExist > 0) {
    logger.info("User already exists.. Skipping seed");
    return;
  }
  const authService = new AuthService(
    new UserRepository(),
    new SessionRepository()
  );
  await authService.signUp({
    name: "Admin",
    email: "admin@admin.app",
    password: "admin",
    confirmPassword: "admin",
  });
  logger.info("User seeded successfully");
}

export { userSeeds };
