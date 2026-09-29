import React from "react";
import { cn } from "@/lib/utils";

interface BreakdownRow {
  label: string;
  value: React.ReactNode;
}

interface BreakdownCardProps {
  rows: BreakdownRow[];
  title?: string;
  className?: string;
}

export function BreakdownCard({
  rows,
  title,
  className,
}: BreakdownCardProps) {
  return (
    <div
      className={cn(
        "tool-card rounded-3xl border border-border bg-card p-5 sm:p-7",
        className
      )}
    >
      {title && (
        <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[.2em] text-primary">
          {title}
        </p>
      )}
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:gap-6"
          >
            <span className="w-40 shrink-0 text-sm font-bold text-foreground">
              {row.label}
            </span>
            <span className="ticker font-mono text-sm text-muted-foreground sm:text-base">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}