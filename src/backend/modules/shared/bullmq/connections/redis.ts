// connections/redis.ts
import IORedis from "ioredis";
import { BULLMQ_CONFIG } from "@/config";

export const redisConnection = new IORedis({
  host: BULLMQ_CONFIG.REDIS_HOST,
  port: Number(BULLMQ_CONFIG.REDIS_PORT),
  password: BULLMQ_CONFIG.REDIS_PASSWORD,

  // penting untuk BullMQ
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
