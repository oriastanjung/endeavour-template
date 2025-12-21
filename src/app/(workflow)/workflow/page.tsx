"use client";

import { Suspense } from "react";
import { WorkflowDashboard } from "@/shared/modules/workflow/ui/pages/workflow-dashboard";

function DashboardLoader() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  return (
    <Suspense fallback={<DashboardLoader />}>
      <WorkflowDashboard />
    </Suspense>
  );
}
