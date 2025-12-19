export type JobType = "foo" | "bar";

export type DataSentType<T> = {
  jobName: JobType;
  data: T;
};
