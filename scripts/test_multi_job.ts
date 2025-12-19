import { addQueueEvent } from "../src/backend/modules/shared/bullmq/utils/addQueueEvent";
import { createLogger } from "@/shared/logger";

const logger = createLogger("test_multi_job");

async function main() {
  logger.info("Publishing multi job with progress tracking...");
  const COUNT_FOO_JOBS = 5;
  const COUNT_BAR_JOBS = 5;

  // Option 1: Fire and forget with callbacks
  for (let i = 0; i < COUNT_FOO_JOBS; i++) {
    await addQueueEvent({
      jobName: "foo",
      data: { task: "Process data", items: 100 },
      callbacks: {
        onProgress: (progress) => {
          logger.info(
            `Progress: ${progress.percentage}% - ${progress.message}`
          );
        },
        onCompleted: (result) => {
          logger.info(`Job completed! ${JSON.stringify(result)}`);
        },
        onFailed: (error) => {
          logger.error("Job failed!", error.message);
        },
      },
    });
  }

  for (let i = 0; i < COUNT_BAR_JOBS; i++) {
    await addQueueEvent({
      jobName: "bar",
      data: { task: "Process data", items: 100 },
      callbacks: {
        onProgress: (progress) => {
          logger.info(
            `Progress: ${progress.percentage}% - ${progress.message}`
          );
        },
        onCompleted: (result) => {
          logger.info(`Job completed! ${JSON.stringify(result)}`);
        },
        onFailed: (error) => {
          logger.error("Job failed!", error.message);
        },
      },
    });
  }

  process.exit(0);
}

main();
