/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { WorkflowNode } from "../../types/Workflow";
import { Zap, Globe, GitBranch, FileOutput, Box, Search } from "lucide-react";

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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Parse nodes for suggestion list
  const allSuggestions = nodes.map((node) => ({
    id: node.id,
    label: node.data.label || node.type,
    type: node.type,
    value: `nodes.${node.id}.output`,
  }));

  // Filter suggestions
  const filteredSuggestions = allSuggestions.filter(
    (s) =>
      s.label.toLowerCase().includes(query.toLowerCase()) ||
      s.id.toLowerCase().includes(query.toLowerCase())
  );

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (open && listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        // Simple scrollIntoView might be enough, or custom logic to avoid jump
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPos = e.target.selectionStart;

    onChangeValue(newValue);
    setCursorPosition(newPos);

    // Detect @ mention
    verifyMentionTrigger(newValue, newPos);
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    // Also check on click in case they moved cursor
    const target = e.target as HTMLTextAreaElement;
    setCursorPosition(target.selectionStart);
    verifyMentionTrigger(value, target.selectionStart);
  };

  const verifyMentionTrigger = (text: string, pos: number) => {
    const textBeforeCursor = text.slice(0, pos);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    if (lastAtPos !== -1) {
      // Check if @ is preceded by space, newline, or start of line, or specific chars like (, {, [, ", '
      if (lastAtPos > 0) {
        const charBefore = textBeforeCursor[lastAtPos - 1];
        // Allow: whitespace, (, {, [, ", ', `, ,
        // Disallow: letters, numbers (which implies it's part of a word like email)
        if (!/[\s\(\{\[\"\'\`\,]/.test(charBefore)) {
          setOpen(false);
          return;
        }
      }

      const textAfterAt = textBeforeCursor.slice(lastAtPos + 1);

      // Check for valid char sequence (no spaces before cursor for now)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setQuery(textAfterAt);
        setOpen(true);
        return;
      }
    }
    setOpen(false);
  };

  const handleSelect = (suggestionId: string) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    if (lastAtPos !== -1) {
      const prefix = value.slice(0, lastAtPos);
      const suffix = value.slice(cursorPosition);
      const insertion = `nodes.${suggestionId}.output`;
      const newValue = prefix + insertion + suffix;

      onChangeValue(newValue);
      setOpen(false);

      // Restore focus and cursor
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newCursorPos = prefix.length + insertion.length;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) =>
          (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      // Tab is also good for completion
      if (filteredSuggestions.length > 0) {
        e.preventDefault();
        handleSelect(filteredSuggestions[selectedIndex].id);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      // Prevent default escape behavior if needed (like closing parent modal)
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "manual.trigger":
        return Zap;
      case "cron.trigger":
        return Box;
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
      <Popover
        open={open}
        onOpenChange={(val) => {
          // Only allow closing via onOpenChange (e.g. clicking outside)
          // We want to manually control OPENING based on @ logic only.
          if (!val) {
            setOpen(false);
          }
        }}
      >
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={handleInputChange}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              className={cn("min-h-[80px] font-mono", className)}
              {...props}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[300px] overflow-hidden"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-2 border-b bg-muted/30 text-xs text-muted-foreground flex items-center gap-2">
            <Search className="w-3 h-3" />
            <span>Filtering by {"{query}"}...</span>
          </div>
          <div ref={listRef} className="max-h-[200px] overflow-y-auto p-1">
            {filteredSuggestions.length === 0 && (
              <div className="p-2 text-center text-sm text-muted-foreground">
                No nodes found.
              </div>
            )}
            {filteredSuggestions.map((item, index) => {
              const Icon = getNodeIcon(item.type);
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer select-none",
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                  onMouseDown={(e) => {
                    // Prevent loss of focus on textarea when clicking
                    e.preventDefault();
                    handleSelect(item.id);
                  }}
                >
                  <Icon className="w-4 h-4 opacity-70" />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate font-medium">{item.label}</span>
                    <span className="truncate text-[10px] opacity-70">
                      {item.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
