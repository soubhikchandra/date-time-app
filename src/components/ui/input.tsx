import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className, id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <label
      htmlFor={inputId}
      className="grid gap-2 text-sm font-bold text-foreground"
    >
      {label && (
        <span className="flex items-baseline justify-between gap-3">
          <span>{label}</span>
          {hint && (
            <span className="font-normal text-muted-foreground">{hint}</span>
          )}
        </span>
      )}
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-xl border border-input bg-background/70 px-3.5 text-sm text-foreground shadow-sm transition",
          "placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none",
          className
        )}
        {...props}
      />
    </label>
  );
}