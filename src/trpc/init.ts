import { initTRPC } from "@trpc/server";
import { Context } from "@/backend/context";

export const t = initTRPC.context<Context>().create();
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
