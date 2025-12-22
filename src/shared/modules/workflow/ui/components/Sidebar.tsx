"use client";

import React, { useState, useMemo } from "react";
import {
  Play,
  Clock,
  GitBranch,
  Globe,
  Flag,
  Search,
  Webhook,
  GitFork,
  ArrowRightLeft,
  Timer,
  PenTool,
  Pencil,
  List,
  Code2,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WorkflowNodeType } from "../../types/Workflow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkflowContext } from "../context/WorkflowContext";
import { useReactFlow } from "@xyflow/react";
import type { WorkflowNode } from "../../types/Workflow";

interface NodeItem {
  type: WorkflowNodeType;
  label: string;
  icon: React.ElementType;
}

interface NodeCategory {
  category: string;
  nodes: NodeItem[];
}

const listNodes: NodeCategory[] = [
  {
    category: "Triggers",
    nodes: [
      { type: "manual.trigger", label: "Manual Trigger", icon: Play },
      { type: "cron.trigger", label: "Cron Trigger", icon: Clock },
      { type: "webhook.trigger", label: "Webhook", icon: Webhook },
    ],
  },
  {
    category: "Actions",
    nodes: [
      { type: "http.request", label: "HTTP Request", icon: Globe },
      { type: "output", label: "Output", icon: Flag },
    ],
  },
  {
    category: "Logic",
    nodes: [
      { type: "condition", label: "Condition", icon: GitBranch },
      { type: "switch", label: "Switch", icon: GitFork },
      { type: "merge", label: "Merge", icon: ArrowRightLeft },
      { type: "wait", label: "Wait", icon: Timer },
    ],
  },
  {
    category: "Data",
    nodes: [
      { type: "set", label: "Set", icon: PenTool },
      { type: "edit.fields", label: "Edit Fields", icon: Pencil },
      { type: "item.lists", label: "Item Lists", icon: List },
      { type: "code", label: "Code", icon: Code2 },
    ],
  },
  {
    category: "Custom",
    nodes: [],
  },
];

export const Sidebar: React.FC = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { setNodes } = useWorkflowContext();
  const { screenToFlowPosition } = useReactFlow();

  const onDragStart = (event: React.DragEvent, nodeType: WorkflowNodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onNodeClick = (nodeType: WorkflowNodeType) => {
    // Add node to center of canvas
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const newNode: WorkflowNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: { label: `New ${nodeType}` },
    };

    setNodes((nds) => nds.concat(newNode));
    setOpen(false); // Close dialog after adding node
  };

  // Filter nodes based on search query
  const filteredNodes = useMemo(() => {
    if (!search.trim()) return listNodes;

    const query = search.toLowerCase();
    return listNodes
      .map((group) => ({
        ...group,
        nodes: group.nodes.filter(
          (node) =>
            node.label.toLowerCase().includes(query) ||
            node.type.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.nodes.length > 0);
  }, [search]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus /> Node
          </Button>
        </DialogTrigger>
        <DialogContent className="h-[90vh] overflow-hidden max-w-[90%] md:max-w-[90%]">
          <DialogHeader>
            <DialogTitle>Add New Node</DialogTitle>
          </DialogHeader>
          <div className="h-full w-full">
            <div className="relative my-4">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search nodes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <ScrollArea className="w-full h-[65vh]">
              <Card className="w-full h-full border-none p-0 shrink-0 overflow-y-auto">
                <CardContent className="flex flex-col gap-2 p-0">
                  {filteredNodes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No nodes found
                    </p>
                  ) : (
                    filteredNodes.map((group, groupIndex) => (
                      <React.Fragment key={group.category}>
                        <div
                          className={`text-xs font-bold text-muted-foreground mb-1 ${
                            groupIndex === 0 ? "mt-2" : "mt-4"
                          }`}
                        >
                          {group.category}
                        </div>
                        <div className="grid grid-cols-12 gap-5">
                          {group.nodes.map((node) => (
                            <DraggableNode
                              key={node.type}
                              type={node.type}
                              label={node.label}
                              icon={node.icon}
                              onDragStart={onDragStart}
                              onNodeClick={onNodeClick}
                            />
                          ))}
                        </div>
                      </React.Fragment>
                    ))
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface DraggableNodeProps {
  type: WorkflowNodeType;
  label: string;
  icon: React.ElementType;
  onDragStart: (event: React.DragEvent, nodeType: WorkflowNodeType) => void;
  onNodeClick: (nodeType: WorkflowNodeType) => void;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({
  type,
  label,
  icon: Icon,
  onDragStart,
  onNodeClick,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 p-3 text-sm bg-background border rounded-md cursor-pointer hover:bg-muted transition-colors shadow-sm"
      draggable
      onDragStart={(event) => onDragStart(event, type)}
      onClick={() => onNodeClick(type)}
    >
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-center text-xs">{label}</span>
    </div>
  );
};
