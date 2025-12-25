"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Zap,
  Code2,
  Database,
  Workflow,
  Bot,
  Clock,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Session-Based Auth",
    description:
      "Secure database-backed sessions with HTTP-only cookies. No tokens exposed to JavaScript.",
    badge: "Security",
    badgeVariant: "default" as const,
  },
  {
    icon: Zap,
    title: "tRPC v11",
    description:
      "End-to-end type-safe APIs with ~40ms response times. Full TypeScript inference.",
    badge: "Performance",
    badgeVariant: "secondary" as const,
  },
  {
    icon: Code2,
    title: "Module Generator",
    description:
      "CLI tool to scaffold complete CRUD modules with Entity, Repository, Service, and Route.",
    badge: "DX",
    badgeVariant: "outline" as const,
  },
  {
    icon: Database,
    title: "Prisma + PostgreSQL",
    description:
      "Type-safe ORM with schema merging, migrations, and Prisma Studio support.",
    badge: "Database",
    badgeVariant: "secondary" as const,
  },
  {
    icon: Workflow,
    title: "Workflow Engine",
    description:
      "Visual drag-and-drop automation with 14+ node types, Handlebars templating, and BullMQ.",
    badge: "Automation",
    badgeVariant: "default" as const,
  },
  {
    icon: Bot,
    title: "LLM SDK",
    description:
      "Ready-to-use OpenAI and Gemini SDKs with structured outputs, RAG, and web search.",
    badge: "AI",
    badgeVariant: "default" as const,
  },
  {
    icon: Clock,
    title: "BullMQ Jobs",
    description:
      "Background job processing with progress tracking, retries, and Bull Board dashboard.",
    badge: "Async",
    badgeVariant: "secondary" as const,
  },
  {
    icon: Layers,
    title: "Docker Ready",
    description:
      "Multi-stage Dockerfile with docker-compose for app, workers, and Redis services.",
    badge: "DevOps",
    badgeVariant: "outline" as const,
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Ship Fast
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Production-ready features out of the box. No more weeks of
            boilerplate setup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <Badge variant={feature.badgeVariant} className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
