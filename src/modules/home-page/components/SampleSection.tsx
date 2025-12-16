"use client";

import { useTRPC } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

function SampleSection() {
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(
    trpc.handshake.handShakeDB.queryOptions()
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{JSON.stringify(data)}</div>;
}

export { SampleSection };
