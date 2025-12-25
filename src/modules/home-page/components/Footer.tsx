"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    documentation: [
      { label: "Getting Started", href: "#documentation" },
      { label: "Architecture", href: "#documentation" },
      { label: "Authentication", href: "#documentation" },
      { label: "Workflow Engine", href: "#documentation" },
    ],
    resources: [
      {
        label: "GitHub",
        href: "https://github.com/oriastanjung/endeavour-template",
      },
      {
        label: "Issues",
        href: "https://github.com/oriastanjung/endeavour-template/issues",
      },
      {
        label: "Discussions",
        href: "https://github.com/oriastanjung/endeavour-template/discussions",
      },
    ],
  };

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold bg-linear-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-4">
              ENDEAVOUR
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Enterprise-Grade Full-Stack TypeScript Framework. Built for
              developers who want to ship fast without sacrificing quality.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/oriastanjung/endeavour-template"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 mr-2" />
                Star on GitHub
              </a>
            </Button>
          </div>

          {/* Documentation Links */}
          <div>
            <h4 className="font-semibold mb-4">Documentation</h4>
            <ul className="space-y-2">
              {links.documentation.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {links.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ENDEAVOUR. MIT License.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Created with <Heart className="h-4 w-4 text-red-500 fill-red-500" />{" "}
            by{" "}
            <a
              href="https://github.com/oriastanjung"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              O. Riastanjung
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
