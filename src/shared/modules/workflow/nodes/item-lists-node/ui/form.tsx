import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkflowNode } from "../../../types/Workflow";
import { MentionTextarea } from "../../../ui/components/mention-textarea";

export const ItemListsForm = ({
  data,
  updateData,
  nodes,
}: {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
  nodes: WorkflowNode[];
}) => {
  const operation = (data.operation as string) || "limit";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Operation</Label>
        <Select
          value={operation}
          onValueChange={(val) => updateData("operation", val)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="limit">Limit</SelectItem>
            <SelectItem value="sort">Sort</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>List Field (Path)</Label>
        <MentionTextarea
          value={(data.field as string) || ""}
          onChangeValue={(val) => updateData("field", val)}
          nodes={nodes}
          placeholder="e.g. nodes.step1.output.users"
          className="min-h-[38px] h-10 py-2"
        />
      </div>

      {operation === "limit" && (
        <div className="space-y-2">
          <Label>Limit to</Label>
          <Input
            type="number"
            value={(data.limit as number) ?? 10}
            onChange={(e) => updateData("limit", parseInt(e.target.value))}
          />
        </div>
      )}

      {operation === "sort" && (
        <>
          <div className="space-y-2">
            <Label>Sort Key</Label>
            <Input
              value={(data.sortKey as string) ?? ""}
              onChange={(e) => updateData("sortKey", e.target.value)}
              placeholder="e.g. name"
            />
          </div>
          <div className="space-y-2">
            <Label>Order</Label>
            <Select
              value={(data.sortOrder as string) || "asc"}
              onValueChange={(val) => updateData("sortOrder", val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground mt-4">
        <p className="font-semibold mb-1">Examples:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            Input Field:{" "}
            <code className="bg-background px-1 rounded">state.users</code>
            {" or "}
            <code className="bg-background px-1 rounded">
              nodes.http.output.body.items
            </code>
          </li>
          <li>
            Sort Key:{" "}
            <code className="bg-background px-1 rounded">created_at</code>
            {" (property name inside items)"}
          </li>
        </ul>
      </div>
    </div>
  );
};
