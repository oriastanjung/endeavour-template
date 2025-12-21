"use client";

import { Suspense } from "react";
import { WorkflowEditor } from "@/shared/modules/workflow/ui/pages/workflow-editor";
import { Loader2 } from "lucide-react";

function EditorLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  );
}

export default function WorkflowDetailPage() {
  return (
    <Suspense fallback={<EditorLoader />}>
      <WorkflowEditor />
    </Suspense>
  );
}
