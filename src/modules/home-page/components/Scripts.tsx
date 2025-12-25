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

export function Scripts() {
  const scripts = [
    { command: "bun run dev", desc: "Start development server" },
    { command: "bun run build", desc: "Build for production" },
    { command: "bun run start", desc: "Start production server" },
    { command: "bun run lint", desc: "Run ESLint" },
    { command: "bun run prisma:merge", desc: "Merge Prisma schemas" },
    { command: "bun run prisma:generate", desc: "Generate Prisma client" },
    { command: "bun run prisma:push", desc: "Push schema to database" },
    { command: "bun run prisma:seed", desc: "Seed the database" },
    { command: "bun run prisma:studio", desc: "Open Prisma Studio" },
    { command: "bun run module:create", desc: "Generate new module" },
    { command: "bun run node:create", desc: "Generate workflow node" },
    {
      command: "bun run dev:all",
      desc: "Start ALL (Next.js + Workers + Bull Board)",
    },
    { command: "bun run workers:run", desc: "Start all workers" },
    { command: "bun run board", desc: "Start Bull Board dashboard" },
  ];

  return (
    <section id="scripts" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            CLI Commands
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Available Scripts
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Common commands you&apos;ll use during development.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>npm/bun scripts</CardTitle>
            <CardDescription>Run these from your project root</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {scripts.map((script, index) => (
                  <div
                    key={script.command}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <code className="text-sm font-mono text-primary">
                      {script.command}
                    </code>
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {script.desc}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
