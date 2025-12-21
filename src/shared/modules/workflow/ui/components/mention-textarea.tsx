"use client";

import React, { useState, useRef } from "react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { WorkflowNode } from "../../types/Workflow";
import { Zap, Globe, GitBranch, FileOutput, Box } from "lucide-react";

interface MentionTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChangeValue: (value: string) => void;
  nodes: WorkflowNode[];
}

export const MentionTextarea = ({
  value,
  onChangeValue,
  nodes,
  className,
  ...props
}: MentionTextareaProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse nodes for suggestion list
  const suggestions = nodes.map((node) => ({
    id: node.id,
    label: node.data.label || node.type,
    type: node.type,
    value: `nodes.${node.id}.output`, // The actual value to insert
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPos = e.target.selectionStart;

    onChangeValue(newValue);
    setCursorPosition(newPos);

    // Simple detection: look for @ followed by characters up to cursor
    const textBeforeCursor = newValue.slice(0, newPos);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    if (lastAtPos !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtPos + 1);
      // Check if there are spaces, which might mean we are not mentioning anymore
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setQuery(textAfterAt);
        setOpen(true);
        return;
      }
    }

    setOpen(false);
  };

  const handleSelect = (suggestionIn: string) => {
    // Find where the @ started
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    if (lastAtPos !== -1) {
      const prefix = value.slice(0, lastAtPos);
      const suffix = value.slice(cursorPosition);

      // Handlebars syntax wrapper could be added here if desired,
      // but user asked for "nodes.id.output" suggestion context.
      // Let's insert the raw path, or maybe wrap in {{ }} if needed?
      // Usually users want the path. Let's give the path.
      // If they want handlebars, they typically type {{ @...

      // Let's assume they want the handlebar variable format without brackets
      // OR with brackets?
      // User example: {{#if (gt nodes.http-req...)}}
      // So they are typing inside {{ }}.

      // We will insert the ID-based path
      const insertion = `nodes.${suggestionIn}.output`;

      const newValue = prefix + insertion + suffix;
      onChangeValue(newValue);

      // Reset
      setOpen(false);

      // Focus back and set cursor
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newCursorPos = prefix.length + insertion.length;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "manual.trigger":
        return Zap;
      case "cron.trigger":
        return Box; // Clock icon usually but Box for generic
      case "http.request":
        return Globe;
      case "condition":
        return GitBranch;
      case "output":
        return FileOutput;
      default:
        return Box;
    }
  };

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={handleInputChange}
              className={cn("min-h-[80px] font-mono", className)}
              {...props}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[300px]"
          align="start"
          // Tip: We can't easily align to cursor without complex mirror.
          // Using align="start" puts it at bottom-left of textarea.
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              <CommandEmpty>No nodes found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                {suggestions
                  .filter(
                    (s) =>
                      s.label.toLowerCase().includes(query.toLowerCase()) ||
                      s.id.toLowerCase().includes(query.toLowerCase())
                  )
                  .map((item) => {
                    const Icon = getNodeIcon(item.type);
                    return (
                      <CommandItem
                        key={item.id}
                        value={item.id} // Command uses value for filtering/selection
                        onSelect={() => handleSelect(item.id)}
                        className="cursor-pointer"
                      >
                        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.id}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
