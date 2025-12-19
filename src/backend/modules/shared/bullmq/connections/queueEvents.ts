import { QueueEvents } from "bullmq";
import { redisConnection } from "./redis";
import { JobType } from "../types/dataSentType";

// QueueEvents factory - creates QueueEvents for specific job type
export const createQueueEvents = (jobType: JobType) => {
  return new QueueEvents(jobType, {
    connection: redisConnection,
  });
};

// Pre-defined QueueEvents for each job type
export const fooQueueEvents = createQueueEvents("foo");
export const barQueueEvents = createQueueEvents("bar");

// Helper to get QueueEvents by job type
export const getQueueEventsByJobType = (jobType: JobType): QueueEvents => {
  const queueEvents: Record<JobType, QueueEvents> = {
    foo: fooQueueEvents,
    bar: barQueueEvents,
  };
  return queueEvents[jobType];
};
