import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import {
  fooQueue,
  barQueue,
} from "../src/backend/modules/shared/bullmq/connections/queues";
import {
  workflowQueue,
  nodeQueue,
} from "../src/shared/modules/workflow/backend/queue";
import { createLogger } from "@/shared/logger";

const logger = createLogger("bull-board");

const PORT = process.env.BULL_BOARD_PORT || 3001;

// Create Express adapter
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/");

// Create bull-board with all queues and UI options
createBullBoard({
  queues: [
    new BullMQAdapter(fooQueue, { readOnlyMode: false }),
    new BullMQAdapter(barQueue, { readOnlyMode: false }),
    new BullMQAdapter(workflowQueue, { readOnlyMode: false }),
    new BullMQAdapter(nodeQueue, { readOnlyMode: false }),
    // Add more queues here as needed
  ],
  serverAdapter,
  options: {
    uiConfig: {
      // Board title
      boardTitle: "🚀 ENDEAVOUR Job Queue",
      // Board logo (optional - can be URL to image)
      boardLogo: {
        path: "https://raw.githubusercontent.com/felixmosh/bull-board/master/packages/ui/src/static/images/logo.svg",
        width: "80px",
        height: 80,
      },
      // Misc options
      miscLinks: [
        { text: "📖 BullMQ Docs", url: "https://docs.bullmq.io/" },
        { text: "🏠 Home", url: "http://localhost:3000" },
      ],
      // Favicon (optional)
      favIcon: {
        default: "static/images/logo.svg",
        alternative: "static/images/logo.svg",
      },
      // Poll interval for real-time updates (in milliseconds)
      // 1000ms = 1 second for more real-time updates
      pollingInterval: { forceInterval: 1000, showSetting: true },
    },
  },
});

// Create Express app
const app = express();

// Enable CORS for development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "bull-board",
    timestamp: new Date().toISOString(),
  });
});

// Use bull-board router
app.use("/", serverAdapter.getRouter());

// Start server and store reference for graceful shutdown
const server = app.listen(PORT, () => {
  console.log("\n");
  console.log(
    "╔══════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                                                                  ║"
  );
  console.log(
    "║   ██████╗ ██╗   ██╗██╗     ██╗         ██████╗  ██████╗  █████╗  ║"
  );
  console.log(
    "║   ██╔══██╗██║   ██║██║     ██║         ██╔══██╗██╔═══██╗██╔══██╗ ║"
  );
  console.log(
    "║   ██████╔╝██║   ██║██║     ██║         ██████╔╝██║   ██║███████║ ║"
  );
  console.log(
    "║   ██╔══██╗██║   ██║██║     ██║         ██╔══██╗██║   ██║██╔══██║ ║"
  );
  console.log(
    "║   ██████╔╝╚██████╔╝███████╗███████╗    ██████╔╝╚██████╔╝██║  ██║ ║"
  );
  console.log(
    "║   ╚═════╝  ╚═════╝ ╚══════╝╚══════╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ║"
  );
  console.log(
    "║                                                                  ║"
  );
  console.log(
    "║                    📊 Queue Dashboard                            ║"
  );
  console.log(
    "║                                                                  ║"
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════════╝"
  );
  console.log("");
  console.log(`  ✅ Dashboard URL : http://localhost:${PORT}`);
  console.log(`  🔄 Auto-refresh  : Every 1 second`);
  console.log(`  📋 Queues        : foo, bar, workflow_queue, node_queue`);
  console.log(`  ❤️  Health check : http://localhost:${PORT}/health`);
  console.log(`  🛑 Press Ctrl+C  : Stop server`);
  console.log("");
  console.log(
    "  ┌─────────────────────────────────────────────────────────────┐"
  );
  console.log(
    "  │  Features:                                                  │"
  );
  console.log(
    "  │  • View waiting, active, completed, failed, delayed jobs    │"
  );
  console.log(
    "  │  • Retry failed jobs with one click                         │"
  );
  console.log(
    "  │  • View job data and error details                          │"
  );
  console.log(
    "  │  • Remove jobs from queue                                   │"
  );
  console.log(
    "  │  • Pause/Resume queues                                      │"
  );
  console.log(
    "  │  • Real-time status updates                                 │"
  );
  console.log(
    "  └─────────────────────────────────────────────────────────────┘"
  );
  console.log("");
  logger.info(`Bull Board running at http://localhost:${PORT}`);
});

// Graceful shutdown handler
const shutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down Bull Board...`);
  logger.info(`Received ${signal}. Shutting down...`);

  server.close(() => {
    console.log("✅ Bull Board server closed.");
    logger.info("Bull Board server closed.");
    process.exit(0);
  });

  // Force exit after 5 seconds if server doesn't close
  setTimeout(() => {
    console.log("⚠️ Forcing exit...");
    process.exit(1);
  }, 5000);
};

// Listen for termination signals
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGHUP", () => shutdown("SIGHUP"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown("uncaughtException");
});
