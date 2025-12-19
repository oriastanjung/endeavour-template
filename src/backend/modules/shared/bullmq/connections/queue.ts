// connections/queue.ts
import { Queue } from "bullmq";
import { redisConnection } from "./redis";
import { BULLMQ_CONFIG } from "@/config";

export const globalQueue = new Queue(BULLMQ_CONFIG.REDIS_QUEUE_NAME, {
  connection: redisConnection,
});
