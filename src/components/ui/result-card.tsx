import React from "react";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ResultCard({ title = "Result", children, className }: ResultCardProps) {
  return (
    <div className={cn("rounded-lg border border-blue-200 bg-blue-50 p-4", className)}>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
        {title}
      </h3>
      <div className="text-gray-900">{children}</div>
    </div>
  );
}