"use client";

import { Suspense } from "react";
import { WorkflowPreview } from "@/shared/modules/workflow/ui/pages/workflow-preview";
import { Loader2 } from "lucide-react";

function PreviewLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    </div>
  );
}

export default function WorkflowPreviewPage() {
  return (
    <Suspense fallback={<PreviewLoader />}>
      <WorkflowPreview />
    </Suspense>
  );
}
