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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WorkflowNodeType } from "../../types/Workflow";

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

  const onDragStart = (event: React.DragEvent, nodeType: WorkflowNodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
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
    <Card className="w-64 h-full border-r rounded-none shrink-0 overflow-y-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
          Nodes
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
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
              {group.nodes.map((node) => (
                <DraggableNode
                  key={node.type}
                  type={node.type}
                  label={node.label}
                  icon={node.icon}
                  onDragStart={onDragStart}
                />
              ))}
            </React.Fragment>
          ))
        )}
      </CardContent>
    </Card>
  );
};

interface DraggableNodeProps {
  type: WorkflowNodeType;
  label: string;
  icon: React.ElementType;
  onDragStart: (event: React.DragEvent, nodeType: WorkflowNodeType) => void;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({
  type,
  label,
  icon: Icon,
  onDragStart,
}) => {
  return (
    <div
      className="flex items-center gap-2 p-3 text-sm bg-background border rounded-md cursor-grab hover:bg-muted transition-colors shadow-sm"
      draggable
      onDragStart={(event) => onDragStart(event, type)}
    >
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span>{label}</span>
    </div>
  );
};
