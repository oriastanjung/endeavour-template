"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, Github, BookOpen, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-background to-muted/30 py-20 md:py-32">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-white/10 bg-size-[50px_50px] mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="container relative mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Version Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            <Zap className="mr-1 h-3.5 w-3.5" />
            v0.1.0 - Alpha Ready
          </Badge>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              ENDEAVOUR
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-medium">
            Enterprise-Grade Full-Stack TypeScript Framework
          </p>

          {/* Tech Stack */}
          <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-2xl">
            Next.js 15 · tRPC · Prisma · PostgreSQL · Session-Based Auth ·
            BullMQ · Workflow Engine
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Button size="lg" className="gap-2">
              <Rocket className="h-4 w-4" />
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <a
                href="https://github.com/oriastanjung/endeavour-template"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </Button>
            <Button size="lg" variant="ghost" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Documentation
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border/50 w-full max-w-2xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {"< 1 week"}
              </div>
              <div className="text-sm text-muted-foreground">
                Time to Production
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">~40ms</div>
              <div className="text-sm text-muted-foreground">API Response</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">14+</div>
              <div className="text-sm text-muted-foreground">
                Workflow Nodes
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Type Safe</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
