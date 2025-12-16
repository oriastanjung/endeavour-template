import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContextFromFetch } from "@/backend/context";
import { appRouter } from "@/backend/_app";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContextFromFetch,
  });
export { handler as GET, handler as POST };
