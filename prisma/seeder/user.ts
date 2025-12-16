import { createLogger } from "@/shared/logger";
import { db } from "@/shared/database";
const logger = createLogger("UserSeeder");

async function userSeeds() {
  const isExist = await db.user.count();
  if (isExist > 0) {
    logger.info("User already exists.. Skipping seed");
    return;
  }
  await db.user.create({
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
    },
  });
  logger.info("User seeded successfully");
}

export { userSeeds };
