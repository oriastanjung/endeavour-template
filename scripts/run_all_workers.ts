import { HandShakeService } from "@/backend/modules/shared/handshake";
import { startFooWorker } from "../src/backend/modules/shared/bullmq/workers/wokersFoo";
import { startBarWorker } from "../src/backend/modules/shared/bullmq/workers/workerBar";
import { createLogger } from "@/shared/logger";
import { Worker } from "bullmq";

const logger = createLogger("run_all_workers");

// Symbols for visual output
const SYMBOLS = {
  CHECK: "✓",
  CROSS: "✗",
  ARROW: "→",
  ROCKET: "🚀",
  STOP: "🛑",
  DB: "🗄️",
  WORKER: "⚙️",
  SUCCESS: "✅",
  ERROR: "❌",
  WARNING: "⚠️",
  INFO: "ℹ️",
};

async function main() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║          🚀 ENDEAVOUR WORKERS - Starting Up                ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("\n");

  // ========== Step 1: Check Database Connection ==========
  console.log(`${SYMBOLS.DB}  [Step 1/3] Checking database connection...`);

  const handShakeService = new HandShakeService();
  const isDBReady = await handShakeService.handShakeDB();

  if (!isDBReady) {
    console.log(`${SYMBOLS.CROSS}  Database connection failed!`);
    logger.error(
      "Database is not ready. Please check the database connection."
    );
    process.exit(1);
  }

  console.log(`${SYMBOLS.CHECK}  Database connection successful!\n`);

  // ========== Step 2: Start Workers ==========
  console.log(`${SYMBOLS.WORKER}  [Step 2/3] Starting workers...`);

  const workers: Worker[] = [];
  const workerNames: string[] = [];

  try {
    // Start Foo Worker
    const fooWorker = await startFooWorker();
    workers.push(fooWorker);
    workerNames.push("foo");
    console.log(`   ${SYMBOLS.CHECK}  Foo Worker started`);

    // Start Bar Worker
    const barWorker = await startBarWorker();
    workers.push(barWorker);
    workerNames.push("bar");
    console.log(`   ${SYMBOLS.CHECK}  Bar Worker started`);

    // Add more workers here...
    // const emailWorker = await startEmailWorker();
    // workers.push(emailWorker);
    // console.log(`   ${SYMBOLS.CHECK}  Email Worker started`);
  } catch (error) {
    console.log(`\n${SYMBOLS.CROSS}  Failed to start workers!`);
    logger.error("Worker startup failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }

  console.log(`\n${SYMBOLS.CHECK}  All workers started successfully!\n`);

  // ========== Step 3: Summary ==========
  console.log(`${SYMBOLS.INFO}  [Step 3/3] Worker Summary`);
  console.log("┌────────────────────────────────────────────────────────────┐");
  console.log("│  Worker Name        │  Status        │  Concurrency        │");
  console.log("├────────────────────────────────────────────────────────────┤");

  workers.forEach((worker, index) => {
    const name = workerNames[index]?.padEnd(17) || "unknown".padEnd(17);
    const status = `${SYMBOLS.SUCCESS} Running`.padEnd(14);
    const concurrency = "5".padEnd(19);
    console.log(`│  ${name} │  ${status} │  ${concurrency} │`);
  });

  console.log("└────────────────────────────────────────────────────────────┘");
  console.log(
    `\n${SYMBOLS.ROCKET}  Total: ${workers.length} worker(s) running`
  );
  console.log(`${SYMBOLS.INFO}  Press Ctrl+C to stop all workers\n`);

  logger.info(`All workers started. Total: ${workers.length} worker(s)`);

  // ========== Graceful Shutdown Handler ==========
  const shutdown = async (signal: string) => {
    console.log(
      `\n${SYMBOLS.STOP}  Received ${signal}. Shutting down gracefully...\n`
    );
    logger.info(`Received ${signal}. Shutting down workers gracefully...`);

    let closedCount = 0;

    await Promise.all(
      workers.map(async (worker, index) => {
        await worker.close();
        closedCount++;
        console.log(`   ${SYMBOLS.CHECK}  ${workerNames[index]} worker closed`);
        logger.info(`Worker closed: ${worker.name}`);
      })
    );

    console.log(
      `\n${SYMBOLS.SUCCESS}  All ${closedCount} worker(s) shut down successfully.`
    );
    console.log(
      "╔════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║          👋 ENDEAVOUR WORKERS - Goodbye!                   ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n"
    );

    logger.info("All workers shut down successfully.");
    process.exit(0);
  };

  // Listen for termination signals
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main();
