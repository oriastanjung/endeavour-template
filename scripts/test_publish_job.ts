import { addQueue } from "../src/backend/modules/shared/bullmq/utils/addQueue";
import { createLogger } from "@/shared/logger";

const logger = createLogger("test_publish_job");

async function main() {
  logger.info("Publishing test job to queue...");

  await addQueue({
    jobName: "foo",
    data: { message: "Hello World", timestamp: new Date().toISOString() },
  });

  logger.info("Job published successfully!");
  process.exit(0);
}

main();
