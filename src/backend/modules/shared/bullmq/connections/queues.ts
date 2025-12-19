// connections/queues.ts
// Separate queues for different job types - more scalable and isolated
import { Queue } from "bullmq";
import { redisConnection } from "./redis";
import { JobType } from "../types/dataSentType";

// Queue factory - creates queue for specific job type
export const createQueue = (jobType: JobType) => {
  return new Queue(jobType, {
    connection: redisConnection,
  });
};

// Pre-defined queues for each job type
export const fooQueue = createQueue("foo");
export const barQueue = createQueue("bar");

// Helper to get queue by job type
export const getQueueByJobType = (jobType: JobType): Queue => {
  const queues: Record<JobType, Queue> = {
    foo: fooQueue,
    bar: barQueue,
  };
  return queues[jobType];
};
