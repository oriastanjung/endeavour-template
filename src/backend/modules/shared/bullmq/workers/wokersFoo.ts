import { Worker } from "bullmq";
import { redisConnection } from "../connections/redis";
import { createLogger } from "@/shared/logger";

const logger = createLogger("worker-foo");

export const startFooWorker = async (
  {
    concurrency,
  }: {
    concurrency?: number;
  } = { concurrency: 5 }
) => {
  // Worker listens to "foo" queue directly
  const worker = new Worker(
    "foo",
    async (job) => {
      logger.info(`[PROCESSING] job=${job.id} name=${job.name}`, job.data);
      // TODO: Add your job processing logic here
    },
    { connection: redisConnection, concurrency }
  );

  // ========== Lifecycle Event Listeners ==========

  // Event: Job becomes active (worker starts processing)
  worker.on("active", (job) => {
    logger.info(`[ACTIVE] job=${job.id} name=${job.name}`);
  });

  // Event: Job completed successfully
  worker.on("completed", (job, result) => {
    logger.info(`[COMPLETED] job=${job.id} name=${job.name}`, { result });
  });

  // Event: Job failed
  worker.on("failed", (job, err) => {
    logger.error(`[FAILED] job=${job?.id} name=${job?.name}`, {
      error: err.message,
      stack: err.stack,
    });
  });

  // Event: Worker encountered an error (Redis connection issues, etc.)
  worker.on("error", (err) => {
    logger.error(`[WORKER ERROR] Foo Worker encountered an error`, {
      error: err.message,
      stack: err.stack,
    });
  });

  // Optional: Job stalled (worker crashed before completing)
  worker.on("stalled", (jobId) => {
    logger.warn(
      `[STALLED] jobId=${jobId} - Job was stalled and will be retried`
    );
  });

  // Optional: Worker is ready/started
  logger.info(
    `[WORKER STARTED] Foo Worker is ready with concurrency=${concurrency}`
  );

  return worker;
};
