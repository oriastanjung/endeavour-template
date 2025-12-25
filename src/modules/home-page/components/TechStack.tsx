"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2 } from "lucide-react";

export function TechStack() {
  const stack = [
    {
      category: "Frontend",
      items: [
        { name: "Next.js 15", description: "App Router, RSC" },
        { name: "React 19", description: "Latest features" },
        { name: "TailwindCSS", description: "Utility-first CSS" },
        { name: "Shadcn/UI", description: "Beautiful components" },
      ],
    },
    {
      category: "Backend",
      items: [
        { name: "tRPC v11", description: "Type-safe APIs" },
        { name: "Prisma ORM", description: "Database toolkit" },
        { name: "PostgreSQL", description: "Relational DB" },
        { name: "Redis", description: "Caching & queues" },
      ],
    },
    {
      category: "Authentication",
      items: [
        { name: "Session-based", description: "Database-backed" },
        { name: "HTTP-only Cookies", description: "Secure storage" },
        { name: "RBAC", description: "Role authorization" },
        { name: "bcrypt", description: "Password hashing" },
      ],
    },
    {
      category: "DevOps",
      items: [
        { name: "Docker", description: "Containerization" },
        { name: "BullMQ", description: "Job queues" },
        { name: "Winston", description: "Logging" },
        { name: "Bun", description: "Fast runtime" },
      ],
    },
  ];

  return (
    <section id="tech-stack" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Tech Stack
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Modern Technology Stack
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built with the best tools for performance, developer experience, and
            maintainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stack.map((category) => (
            <Card key={category.category} className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div key={item.name} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
