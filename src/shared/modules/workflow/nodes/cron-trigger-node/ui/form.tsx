"use client";

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
import { cn } from "@/lib/utils";
import { Clock, Repeat, Calendar } from "lucide-react";
import type { WorkflowNode } from "../../../types/Workflow";

export interface NodeFormProps {
  data: Record<string, unknown>;
  updateData: (key: string, value: unknown) => void;
  nodes: WorkflowNode[];
}

type ScheduleType = "interval" | "daily" | "weekly" | "custom";
type IntervalUnit = "seconds" | "minutes" | "hours";

interface ScheduleConfig {
  type: ScheduleType;
  // Interval
  intervalValue?: number;
  intervalUnit?: IntervalUnit;
  // Daily/Weekly
  time?: string; // HH:mm
  // Weekly
  days?: number[]; // 0=Sun, 6=Sat
}

export const CronTriggerForm: React.FC<NodeFormProps> = ({
  data,
  updateData,
}) => {
  // Load config or default to custom if existing cron is present but no config
  const config: ScheduleConfig = (data.scheduleConfig as ScheduleConfig) || {
    type: data.cronExpression ? "custom" : "interval",
    intervalValue: 15,
    intervalUnit: "minutes",
    time: "09:00",
    days: [1, 2, 3, 4, 5], // Mon-Fri default
  };

  const setConfig = (newConfig: Partial<ScheduleConfig>) => {
    const merged = { ...config, ...newConfig };
    updateData("scheduleConfig", merged);
    generateCron(merged);
  };

  const generateCron = (cfg: ScheduleConfig) => {
    let expr = "";
    if (cfg.type === "interval") {
      const val = cfg.intervalValue || 1;
      if (cfg.intervalUnit === "hours") {
        expr = `0 */${val} * * *`;
      } else if (cfg.intervalUnit === "seconds") {
        expr = `*/${val} * * * * *`;
      } else {
        expr = `*/${val} * * * *`;
      }
    } else if (cfg.type === "daily") {
      const [hh, mm] = (cfg.time || "00:00").split(":");
      expr = `${parseInt(mm)} ${parseInt(hh)} * * *`;
    } else if (cfg.type === "weekly") {
      const [hh, mm] = (cfg.time || "00:00").split(":");
      const days = (cfg.days || []).join(",");
      expr = `${parseInt(mm)} ${parseInt(hh)} * * ${days}`;
    } else {
      // Custom: don't overwrite if switching TO custom, keep existing
      // If switching FROM others, maybe keep empty or previous?
      // Logic handles this by input field updating cronExpression directly
      return;
    }
    updateData("cronExpression", expr);
  };

  const toggleDay = (day: number) => {
    const current = config.days || [];
    const exists = current.includes(day);
    let newDays;
    if (exists) {
      newDays = current.filter((d) => d !== day);
    } else {
      newDays = [...current, day].sort();
    }
    setConfig({ days: newDays });
  };

  const weekDays = [
    { label: "S", val: 0 },
    { label: "M", val: 1 },
    { label: "T", val: 2 },
    { label: "W", val: 3 },
    { label: "T", val: 4 },
    { label: "F", val: 5 },
    { label: "S", val: 6 },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Schedule Type</Label>
        <Select
          value={config.type}
          onValueChange={(val) => setConfig({ type: val as ScheduleType })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interval">
              <span className="flex items-center">
                <Repeat className="w-4 h-4 mr-2" /> Loop (Interval)
              </span>
            </SelectItem>
            <SelectItem value="daily">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-2" /> Daily
              </span>
            </SelectItem>
            <SelectItem value="weekly">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" /> Weekly
              </span>
            </SelectItem>
            <SelectItem value="custom">Custom Cron</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.type === "interval" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Every</Label>
            <Input
              type="number"
              min={1}
              value={config.intervalValue}
              onChange={(e) =>
                setConfig({ intervalValue: parseInt(e.target.value) || 1 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Select
              value={config.intervalUnit}
              onValueChange={(val) =>
                setConfig({ intervalUnit: val as IntervalUnit })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seconds">Seconds</SelectItem>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {(config.type === "daily" || config.type === "weekly") && (
        <div className="space-y-2">
          <Label>Run at (Time)</Label>
          <Input
            type="time"
            value={config.time}
            onChange={(e) => setConfig({ time: e.target.value })}
          />
        </div>
      )}

      {config.type === "weekly" && (
        <div className="space-y-2">
          <Label>On Days</Label>
          <div className="flex gap-2">
            {weekDays.map((d) => (
              <button
                type="button"
                key={d.val}
                onClick={() => toggleDay(d.val)}
                className={cn(
                  "w-8 h-8 rounded-full text-xs font-bold border transition-colors",
                  (config.days || []).includes(d.val)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground hover:bg-muted"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {config.type === "custom" && (
        <div className="space-y-3">
          <Label>Cron Expression</Label>
          <Input
            value={(data.cronExpression as string) || ""}
            onChange={(e) => updateData("cronExpression", e.target.value)}
            placeholder="0 0 * * *"
            className="font-mono"
          />

          <div className="rounded-md bg-muted p-3 text-xs space-y-2">
            <p className="font-semibold text-foreground">
              Examples (Click to use):
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                className="text-left hover:text-primary transition-colors cursor-pointer"
                onClick={() => updateData("cronExpression", "*/10 * * * * *")}
              >
                <code className="bg-background px-1 rounded">
                  */10 * * * * *
                </code>{" "}
                Every 10 seconds
              </button>
              <button
                type="button"
                className="text-left hover:text-primary transition-colors cursor-pointer"
                onClick={() => updateData("cronExpression", "*/5 * * * *")}
              >
                <code className="bg-background px-1 rounded">*/5 * * * *</code>{" "}
                Every 5 minutes
              </button>
              <button
                type="button"
                className="text-left hover:text-primary transition-colors cursor-pointer"
                onClick={() => updateData("cronExpression", "0 9 * * 1-5")}
              >
                <code className="bg-background px-1 rounded">0 9 * * 1-5</code>{" "}
                Mon-Fri at 09:00
              </button>
            </div>
            <p className="text-muted-foreground pt-2 border-t">
              Format: <code>sec min hour day month weekday</code>
            </p>
          </div>
        </div>
      )}

      {config.type !== "custom" && (
        <div className="rounded-md border p-3 bg-muted/30">
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Generated Schedule
            </Label>
            <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {data.cronExpression as string}
            </span>
          </div>
          <p className="text-sm font-medium">
            {config.type === "interval" &&
              `Runs every ${config.intervalValue} ${config.intervalUnit}`}
            {config.type === "daily" && `Runs daily at ${config.time}`}
            {config.type === "weekly" &&
              `Runs weekly on selected days at ${config.time}`}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Timezone</Label>
        <Input
          value={(data.timezone as string) || ""}
          onChange={(e) => updateData("timezone", e.target.value)}
          placeholder="Asia/Jakarta"
        />
        <p className="text-xs text-muted-foreground">
          Defaults to UTC if empty. Set to your local timezone (e.g.
          Asia/Jakarta) for accurate daily schedules.
        </p>
      </div>
    </div>
  );
};

export default CronTriggerForm;
