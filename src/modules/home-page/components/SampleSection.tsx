"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useTRPC } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

function SampleSection() {
  const { user } = useAuth();
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(
    trpc.handshake.handShakeDB.queryOptions()
  );
  const { data: session } = useQuery(trpc.auth.getSessions.queryOptions());

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <div>
      {JSON.stringify(data)}
      <div>{JSON.stringify(user)}</div>
      <div>{JSON.stringify(session)}</div>
    </div>
  );
}

export { SampleSection };
