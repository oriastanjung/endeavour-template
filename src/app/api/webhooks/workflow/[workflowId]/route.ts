/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { workflowQueue } from "@/shared/modules/workflow/backend/queue";
import { db } from "@/shared/database";
import { WebhookTriggerConfig } from "@/shared/modules/workflow/nodes/webhook-trigger-node/sheet";

async function handler(
  req: NextRequest,
  props: { params: Promise<{ workflowId: string }> }
) {
  try {
    const params = await props.params;
    const { workflowId } = params;

    // 1. Fetch Workflow
    const workflow = await db.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    if (!workflow.isActive) {
      return NextResponse.json(
        { error: "Workflow is inactive" },
        { status: 400 }
      );
    }

    // 2. Find Webhook Trigger Node configuration
    const webhookNode = workflow.nodes.find(
      (n) => n.type === "webhook.trigger"
    );
    if (!webhookNode) {
      return NextResponse.json(
        { error: "Workflow has no webhook trigger" },
        { status: 400 }
      );
    }

    const config = webhookNode.config as unknown as WebhookTriggerConfig;
    const requiredMethod = config.method || "POST";

    // 3. Validate Method
    if (req.method !== requiredMethod) {
      return NextResponse.json(
        {
          error: `Method ${req.method} not allowed. Expected ${requiredMethod}`,
        },
        { status: 405 }
      );
    }

    // 4. Parse Body (if applicable)
    let payload = {};
    if (req.method !== "GET" && req.method !== "DELETE") {
      try {
        payload = await req.json();
      } catch (e) {
        // If body is not JSON but payload validation is required, this might be an issue.
        // For now, assume empty or non-json body if parse fails.
      }
    }

    // 5. Validate Headers (Auth)
    if (config.requiredHeaders && Array.isArray(config.requiredHeaders)) {
      for (const h of config.requiredHeaders) {
        const incomingVal = req.headers.get(h.key.toLowerCase()); // Headers are case insensitive
        // We use exact match for now
        if (incomingVal !== h.value) {
          return NextResponse.json(
            { error: "Unauthorized: Invalid Headers" },
            { status: 401 }
          );
        }
      }
    }

    // 6. Validate Payload
    if (config.requiredPayload && Array.isArray(config.requiredPayload)) {
      for (const p of config.requiredPayload) {
        const key = p.key;
        const expectedVal = p.value;
        const actualVal = (payload as Record<string, any>)[key];

        // Simple equality check (convert to string to be safe)
        if (String(actualVal) !== String(expectedVal)) {
          return NextResponse.json(
            { error: "Unauthorized: Invalid Payload" },
            { status: 401 }
          );
        }
      }
    }

    // 7. Enqueue Job
    await workflowQueue.add("webhook", {
      workflowId,
      stateIn: {
        input: payload,
        headers: Object.fromEntries(req.headers.entries()),
        query: Object.fromEntries(req.nextUrl.searchParams.entries()),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Workflow execution triggered",
    });
  } catch (error) {
    console.error("Webhook trigger error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export methods dynamically
export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
