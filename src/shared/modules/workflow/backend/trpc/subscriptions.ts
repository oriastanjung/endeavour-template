// src/shared/modules/workflow/backend/trpc/subscriptions.ts
// tRPC subscriptions for real-time execution updates

import { z } from "zod";
import { observable } from "@trpc/server/observable";
import { baseProcedure, createTRPCRouter } from "@/backend/trpc/init";
import { ee } from "../queue/events";
import type { ExecutionEvent } from "../types";

export const workflowSubscriptionsRouter = createTRPCRouter({
  /**
   * Subscribe to execution events
   */
  onExecutionEvents: baseProcedure
    .input(z.object({ executionId: z.string() }))
    .subscription(({ input }) => {
      return observable<ExecutionEvent>((emit) => {
        const channel = `execution:${input.executionId}`;

        const handler = (event: ExecutionEvent) => {
          emit.next(event);
        };

        console.log(`[Subscription] Client subscribed to ${channel}`);
        ee.on(channel, handler);

        return () => {
          console.log(`[Subscription] Client unsubscribed from ${channel}`);
          ee.off(channel, handler);
        };
      });
    }),
});

export type WorkflowSubscriptionsRouter = typeof workflowSubscriptionsRouter;
