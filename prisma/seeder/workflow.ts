import { createLogger } from "@/shared/logger";
import { db } from "@/shared/database";

const logger = createLogger("WorkflowSeeder");

/**
 * Workflow Template Seeder
 * Creates a sample workflow:
 * Manual Trigger → HTTP Request (Random User API) → Condition → Output 1 (true) / Output 2 (false)
 */
async function workflowSeeds() {
  // Check if workflow already exists
  const existingWorkflow = await db.workflow.findFirst({
    where: { name: "Random User Workflow" },
  });

  if (existingWorkflow) {
    logger.info(
      "Workflow 'Random User Workflow' exists. Deleting to re-seed..."
    );
    await db.workflow.delete({ where: { id: existingWorkflow.id } });
  }

  // Create the workflow with nodes and edges
  const workflow = await db.workflow.create({
    data: {
      name: "Random User Workflow",
      description: `Fetches a random user from API and branches based on data (Seeded at ${new Date().toISOString()})`,
      ownerId: "demo-user", // TODO: Replace with actual user ID from auth
      isActive: true,
    },
  });

  // Create Nodes
  console.log("Creating nodes...");

  await db.workflowNode.create({
    data: {
      id: "seed-manual-trigger",
      workflowId: workflow.id,
      type: "manual.trigger",
      label: "Start",
      positionX: 50,
      positionY: 150,
      config: {},
    },
  });

  await db.workflowNode.create({
    data: {
      id: "seed-http-request",
      workflowId: workflow.id,
      type: "http.request",
      label: "Fetch Random User",
      positionX: 300,
      positionY: 150,
      config: {
        method: "GET",
        url: "https://randomuser.me/api/",
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      },
    },
  });

  await db.workflowNode.create({
    data: {
      id: "seed-condition",
      workflowId: workflow.id,
      type: "condition",
      label: "Has Data?",
      positionX: 550,
      positionY: 150,
      config: {
        expression:
          "{{#if nodes.seed-http-request.output.body.results}}true{{else}}false{{/if}}",
      },
    },
  });

  await db.workflowNode.create({
    data: {
      id: "seed-output-success",
      workflowId: workflow.id,
      type: "output",
      label: "Output: User Found",
      positionX: 850,
      positionY: 50,
      config: {
        outputKey: "user_data",
        captureAll: true,
      },
    },
  });

  await db.workflowNode.create({
    data: {
      id: "seed-output-nodata",
      workflowId: workflow.id,
      type: "output",
      label: "Output: No User",
      positionX: 850,
      positionY: 250,
      config: {
        outputKey: "no_data",
        captureAll: false,
      },
    },
  });

  // Create Edges
  console.log("Creating edges...");

  await db.workflowEdge.createMany({
    data: [
      {
        id: "seed-edge-1",
        workflowId: workflow.id,
        sourceNodeId: "seed-manual-trigger",
        targetNodeId: "seed-http-request",
      },
      {
        id: "seed-edge-2",
        workflowId: workflow.id,
        sourceNodeId: "seed-http-request",
        targetNodeId: "seed-condition",
      },
      {
        id: "seed-edge-3",
        workflowId: workflow.id,
        sourceNodeId: "seed-condition",
        targetNodeId: "seed-output-success",
        label: "true",
      },
      {
        id: "seed-edge-4",
        workflowId: workflow.id,
        sourceNodeId: "seed-condition",
        targetNodeId: "seed-output-nodata",
        label: "false",
      },
    ],
  });

  logger.info(
    `Workflow '${workflow.name}' seeded successfully (ID: ${workflow.id})`
  );
}

export { workflowSeeds };
