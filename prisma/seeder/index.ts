import { userSeeds } from "./user";
import { workflowSeeds } from "./workflow";
import { createLogger } from "@/shared/logger";
import dotenv from "dotenv";
dotenv.config();

const logger = createLogger("Seeder");

async function runSeeds() {
  logger.info("Running seeds...");
  const tasks = [];
  tasks.push(userSeeds());
  tasks.push(workflowSeeds());
  await Promise.all(tasks);
  logger.info("All Seeds completed");
}

runSeeds();
