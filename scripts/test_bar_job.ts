import {
  //   addQueueEventAsync,
  addQueueEvent,
} from "../src/backend/modules/shared/bullmq/utils/addQueueEvent";
import { createLogger } from "@/shared/logger";

const logger = createLogger("test_bar_job");

async function main() {
  logger.info("Publishing bar job with progress tracking...");

  // Option 1: Fire and forget with callbacks
  await addQueueEvent({
    jobName: "bar",
    data: { task: "Process data", items: 100 },
    callbacks: {
      onProgress: (progress) => {
        logger.info(`Progress: ${progress.percentage}% - ${progress.message}`);
      },
      onCompleted: (result) => {
        logger.info(`Job completed! ${JSON.stringify(result)}`);
      },
      onFailed: (error) => {
        logger.error("Job failed!", error.message);
      },
    },
  });

  // Option 2: Await completion with progress tracking
  //   try {
  //     const result = await addQueueEventAsync({
  //       jobName: "bar",
  //       data: { task: "Process important data", items: 100 },
  //       onProgress: (progress) => {
  //         logger.info(
  //           `📊 Progress: ${progress.percentage}% - ${progress.message}`
  //         );
  //       },
  //     });

  //     logger.info("✅ Job completed successfully!", { result });
  //   } catch (error) {
  //     logger.error("❌ Job failed!", {
  //       error: error instanceof Error ? error.message : String(error),
  //     });
  //   }

  process.exit(0);
}

main();
