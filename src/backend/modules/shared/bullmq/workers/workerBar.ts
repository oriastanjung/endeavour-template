import { Worker, Job } from "bullmq";
import { redisConnection } from "../connections/redis";
import { createLogger } from "@/shared/logger";
import { ProgressData } from "../utils/addQueueEvent";

const logger = createLogger("worker-bar");

/**
 * Example: Process data with progress tracking
 * This simulates a long-running task that reports progress
 */
async function processBarJob(
  job: Job
): Promise<{ success: boolean; processedAt: string }> {
  const totalSteps = 5;

  for (let step = 1; step <= totalSteps; step++) {
    // Simulate work
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Calculate progress
    const percentage = Math.round((step / totalSteps) * 100);

    // Report progress - This will be emitted via QueueEvents
    const progressData: ProgressData = {
      percentage,
      message: `Processing step ${step}/${totalSteps}`,
      metadata: {
        step,
        totalSteps,
        jobData: job.data,
      },
    };

    await job.updateProgress(progressData);
    logger.info(
      `[PROGRESS] job=${job.id} step=${step}/${totalSteps} (${percentage}%)`
    );

    // TODO: Store progress to database here
    // Example: await db.jobProgress.upsert({ jobId: job.id, ...progressData });
  }

  return {
    success: true,
    processedAt: new Date().toISOString(),
  };
}

export const startBarWorker = async (
  {
    concurrency,
  }: {
    concurrency?: number;
  } = { concurrency: 5 }
) => {
  // Worker listens to "bar" queue directly
  const worker = new Worker(
    "bar",
    async (job) => {
      logger.info(`[PROCESSING] job=${job.id} name=${job.name}`, job.data);

      try {
        // Process the job with progress tracking
        const result = await processBarJob(job);
        logger.info(`[SUCCESS] job=${job.id} completed`, result);
        return result;
      } catch (error) {
        logger.error(`[ERROR] job=${job.id} failed during processing`, {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
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

  // Event: Worker encountered an error
  worker.on("error", (err) => {
    logger.error(`[WORKER ERROR] Bar Worker encountered an error`, {
      error: err.message,
      stack: err.stack,
    });
  });

  // Event: Job stalled
  worker.on("stalled", (jobId) => {
    logger.warn(
      `[STALLED] jobId=${jobId} - Job was stalled and will be retried`
    );
  });

  // Worker started
  logger.info(
    `[WORKER STARTED] Bar Worker is ready with concurrency=${concurrency}`
  );

  return worker;
};
