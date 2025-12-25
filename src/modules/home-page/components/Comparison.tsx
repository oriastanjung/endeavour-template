"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";

export function Comparison() {
  return (
    <section id="comparison" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Why ENDEAVOUR?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Sweet Spot
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Not too simple, not too complex. Just right for production.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature Comparison */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aspect</TableHead>
                    <TableHead>Basic Templates</TableHead>
                    <TableHead>Over-Engineered</TableHead>
                    <TableHead className="text-primary font-bold">
                      ENDEAVOUR
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Time to Production
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      4-6 weeks
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      2-3 weeks
                    </TableCell>
                    <TableCell className="font-bold text-green-500">
                      {"< 1 week"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Learning Curve
                    </TableCell>
                    <TableCell className="text-muted-foreground">Low</TableCell>
                    <TableCell className="text-muted-foreground">
                      Very High
                    </TableCell>
                    <TableCell className="font-bold text-green-500">
                      Moderate
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Authentication
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      None/Basic
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      Complex OAuth
                    </TableCell>
                    <TableCell className="font-bold text-green-500">
                      Session + RBAC
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Type Safety</TableCell>
                    <TableCell className="text-muted-foreground">
                      Partial
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      Full but complex
                    </TableCell>
                    <TableCell className="font-bold text-green-500">
                      Full E2E
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Code Generation
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      None
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      Heavy codegen
                    </TableCell>
                    <TableCell className="font-bold text-green-500">
                      Smart CLI
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Features Included */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 text-lg">Right-Sized Complexity</h3>
              <div className="space-y-3">
                {[
                  {
                    feature: "Session Auth",
                    included: true,
                    reason: "Most apps need secure auth",
                  },
                  {
                    feature: "RBAC",
                    included: true,
                    reason: "Role-based access is common",
                  },
                  {
                    feature: "Module Generator",
                    included: true,
                    reason: "Speeds up development 10x",
                  },
                  {
                    feature: "Job Queues (BullMQ)",
                    included: true,
                    reason: "Background processing",
                  },
                  {
                    feature: "Workflow Engine",
                    included: true,
                    reason: "Visual automation",
                  },
                  {
                    feature: "LLM SDKs",
                    included: true,
                    reason: "AI integration ready",
                  },
                  {
                    feature: "Microservices",
                    included: false,
                    reason: "Monolith first, split later",
                  },
                  {
                    feature: "GraphQL",
                    included: false,
                    reason: "tRPC is simpler & faster",
                  },
                ].map((item) => (
                  <div
                    key={item.feature}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {item.included ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span
                        className={
                          item.included
                            ? "font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {item.feature}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {item.reason}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
