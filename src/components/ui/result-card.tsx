import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultPanelProps {
  title?: string;
  empty?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ResultPanel({
  title = "Your answer",
  empty = false,
  children,
  className,
}: ResultPanelProps) {
  return (
    <aside
      className={cn(
        "flex min-h-[210px] flex-col justify-between rounded-2xl border p-5",
        empty
          ? "border-dashed border-border bg-muted/35"
          : "border-primary/15 bg-primary/[.055] result-pop",
        className
      )}
    >
      <div>
        <div className="mb-5 flex items-center justify-between">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[.2em] text-primary">
            {title}
          </span>
          {!empty && (
            <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary">
              <Check size={13} />
            </span>
          )}
        </div>
        {children}
      </div>
    </aside>
  );
}