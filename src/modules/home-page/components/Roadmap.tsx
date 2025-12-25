"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export function Roadmap() {
  const roadmap = {
    implemented: [
      "Next.js 15 with App Router",
      "tRPC v11 integration",
      "Prisma with PostgreSQL",
      "Shadcn/UI components",
      "Session-based authentication",
      "RBAC middleware",
      "Session activity monitoring",
      "Docker deployment configuration",
      "Module generator CLI",
      "BullMQ job queue with progress tracking",
      "Bull Board dashboard",
      "OpenAI SDK integration",
      "Gemini SDK integration",
      "Workflow Engine",
    ],
    inProgress: ["More workflow node types"],
    planned: [
      "Email verification",
      "Password reset flow",
      "Rate limiting",
      "API documentation (OpenAPI)",
      "E2E testing with Playwright",
      "CI/CD pipelines",
    ],
  };

  return (
    <section id="roadmap" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Roadmap
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Development Progress
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Track our progress and upcoming features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Implemented */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="font-bold text-lg">Implemented</h3>
              <Badge variant="secondary" className="ml-auto">
                {roadmap.implemented.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {roadmap.implemented.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 p-2 bg-green-500/10 rounded-lg"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-yellow-500" />
              <h3 className="font-bold text-lg">In Progress</h3>
              <Badge variant="secondary" className="ml-auto">
                {roadmap.inProgress.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {roadmap.inProgress.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded-lg"
                >
                  <Clock className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Planned */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Circle className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-bold text-lg">Planned</h3>
              <Badge variant="secondary" className="ml-auto">
                {roadmap.planned.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {roadmap.planned.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 p-2 bg-muted rounded-lg"
                >
                  <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
