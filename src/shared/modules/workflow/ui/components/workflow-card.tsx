"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Play,
  Edit,
  Trash2,
  MoreVertical,
  GitBranch,
  Clock,
} from "lucide-react";

export interface WorkflowCardData {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  version: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    nodes: number;
    executions: number;
  };
}

interface WorkflowCardProps {
  workflow: WorkflowCardData;
  onDelete?: (id: string) => void;
}

export function WorkflowCard({ workflow, onDelete }: WorkflowCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg truncate">
                {workflow.name}
              </CardTitle>
              <Badge
                variant={workflow.isActive ? "default" : "secondary"}
                className="shrink-0"
              >
                {workflow.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {workflow.description || "No description"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/workflow/detail/${workflow.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/workflow/preview/${workflow.id}`}>
                  <Play className="h-4 w-4 mr-2" />
                  Preview & Run
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete?.(workflow.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <GitBranch className="h-4 w-4" />
            <span>{workflow._count?.nodes ?? 0} nodes</span>
          </div>
          <div className="flex items-center gap-1">
            <Play className="h-4 w-4" />
            <span>{workflow._count?.executions ?? 0} runs</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Clock className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(workflow.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/workflow/detail/${workflow.id}`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild className="flex-1">
            <Link href={`/workflow/preview/${workflow.id}`}>
              <Play className="h-4 w-4 mr-1" />
              Run
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
