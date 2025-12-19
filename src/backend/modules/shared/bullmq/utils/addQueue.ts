import { getQueueByJobType } from "../connections/queues";
import { DataSentType } from "../types/dataSentType";

export const addQueue = async <T>({ jobName, data }: DataSentType<T>) => {
  const queue = getQueueByJobType(jobName);
  await queue.add(jobName, data);
};
