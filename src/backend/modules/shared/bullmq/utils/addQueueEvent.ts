import { getQueueByJobType } from "../connections/queues";
import { getQueueEventsByJobType } from "../connections/queueEvents";
import { DataSentType } from "../types/dataSentType";
import { createLogger } from "@/shared/logger";

const logger = createLogger("addQueueEvent");

export type ProgressData = {
  percentage: number;
  message?: string;
  metadata?: Record<string, unknown>;
};

export type JobEventCallbacks = {
  onProgress?: (progress: ProgressData) => void;
  onCompleted?: (result: unknown) => void;
  onFailed?: (error: Error) => void;
};

/**
 * Add a job to the queue with realtime event listening
 * This allows the caller to track progress, completion, and failure in realtime
 */
export const addQueueEvent = async <T>({
  jobName,
  data,
  callbacks,
}: DataSentType<T> & { callbacks?: JobEventCallbacks }) => {
  const queue = getQueueByJobType(jobName);
  const queueEvents = getQueueEventsByJobType(jobName);

  const job = await queue.add(jobName, data);
  const jobId = job.id;

  logger.info(`[QUEUE EVENT] Job added: id=${jobId} name=${jobName}`);

  if (!callbacks) return job;

  // Listen for progress updates
  if (callbacks.onProgress) {
    queueEvents.on("progress", ({ jobId: eventJobId, data }) => {
      if (eventJobId === jobId) {
        logger.info(`[PROGRESS] job=${jobId}`, { progress: data });
        callbacks.onProgress!(data as ProgressData);
      }
    });
  }

  // Listen for completion
  if (callbacks.onCompleted) {
    queueEvents.on("completed", ({ jobId: eventJobId, returnvalue }) => {
      if (eventJobId === jobId) {
        logger.info(`[COMPLETED] job=${jobId}`, { result: returnvalue });
        callbacks.onCompleted!(returnvalue);
      }
    });
  }

  // Listen for failure
  if (callbacks.onFailed) {
    queueEvents.on("failed", ({ jobId: eventJobId, failedReason }) => {
      if (eventJobId === jobId) {
        logger.error(`[FAILED] job=${jobId}`, { error: failedReason });
        callbacks.onFailed!(new Error(failedReason));
      }
    });
  }

  return job;
};

/**
 * Wait for a job to complete with progress tracking
 * Returns a promise that resolves when the job completes or rejects on failure
 */
export const addQueueEventAsync = async <T, R = unknown>({
  jobName,
  data,
  onProgress,
}: DataSentType<T> & {
  onProgress?: (progress: ProgressData) => void;
}): Promise<R> => {
  return new Promise(async (resolve, reject) => {
    const job = await addQueueEvent({
      jobName,
      data,
      callbacks: {
        onProgress,
        onCompleted: (result) => resolve(result as R),
        onFailed: (error) => reject(error),
      },
    });

    logger.info(`[QUEUE EVENT ASYNC] Waiting for job=${job.id} to complete...`);
  });
};
