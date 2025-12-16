import { db } from "@/shared/database";
import { createTRPCRouter } from "@/backend/trpc/init";
import { baseProcedure } from "@/backend/trpc/init";
import { createLogger } from "@/shared/logger";

const logger = createLogger("handshake");

export class HandShakeService implements IHandShakeServiceInterface {
  constructor() {}

  /**
   * Performs a handshake with the PostgreSQL database by running a simple command.
   * Returns true if the connection is healthy, otherwise throws an error.
   */
  async handShakeDB(): Promise<boolean> {
    try {
      await db.$queryRaw`SELECT 1`;
      logger.info("Database handshake successful");
      return true;
    } catch (error) {
      logger.error("Database handshake failed: " + (error as Error).message);
      throw new Error("Database handshake failed: " + (error as Error).message);
    }
  }
}

interface IHandShakeServiceInterface {
  handShakeDB: () => Promise<boolean>;
}

export class HandShakeRouter {
  generateRouter() {
    return createTRPCRouter({
      handShakeDB: baseProcedure.query(async ({ ctx }) => {
        return await ctx.container.handshakeService.handShakeDB();
      }),
    });
  }
}
