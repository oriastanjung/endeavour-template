"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTRPC } from "@/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkflowList } from "@/shared/modules/workflow/ui/pages/workflow-list";
import { CreateWorkflowDialog } from "@/shared/modules/workflow/ui/components/create-workflow-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, LayoutGrid, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 12;

export function WorkflowDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const currentPage = Number(searchParams.get("page")) || 1;
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch workflows
  const { data, isLoading, refetch } = useQuery(
    trpc.workflow.list.queryOptions({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      keyword: keyword || undefined,
    })
  );

  // Create workflow mutation
  const createMutation = useMutation(
    trpc.workflow.create.mutationOptions({
      onSuccess: (workflow) => {
        toast.success("Workflow created successfully!");
        router.push(`/workflow/detail/${workflow.id}`);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create workflow");
      },
    })
  );

  // Delete workflow mutation
  const deleteMutation = useMutation(
    trpc.workflow.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Workflow deleted");
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.list.queryKey(),
        });
        refetch();
        setDeleteId(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete workflow");
      },
    })
  );

  const handleCreate = async (formData: {
    name: string;
    description?: string;
  }) => {
    await createMutation.mutateAsync({
      name: formData.name,
      description: formData.description,
      nodes: [],
      edges: [],
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/workflow?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    params.set("page", "1");
    router.push(`/workflow?${params.toString()}`);
  };

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 1;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <LayoutGrid className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Workflows</h1>
              <p className="text-muted-foreground">
                Manage and run your automation workflows
              </p>
            </div>
          </div>
          <CreateWorkflowDialog
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
          />
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      {/* Workflow List */}
      <WorkflowList
        workflows={data?.workflows ?? []}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onDelete={(id) => setDeleteId(id)}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workflow? This action cannot
              be undone. All execution history will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteId && deleteMutation.mutate({ id: deleteId })
              }
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default WorkflowDashboard;
