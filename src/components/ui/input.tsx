import React, { useRef } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className, id, type, ...props }: InputProps) {
  const inputId = id || props.name;
  const innerRef = useRef<HTMLInputElement>(null);
  const isDate = type === "date";
  const isDateTime = type === "datetime-local";
  const isPicker = isDate || isDateTime;

  const openPicker = () => {
    const el = innerRef.current;
    if (!el) return;
    // showPicker() is supported in modern Chrome/Safari/Edge/Firefox
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch {
        /* fall through */
      }
    }
    el.focus();
    el.click();
  };

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

      <div className="relative">
        <input
          id={inputId}
          ref={innerRef}
          type={type}
          className={cn(
            "h-11 w-full rounded-xl border border-input bg-background/70 px-3.5 text-sm text-foreground shadow-sm transition",
            "placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none",
            // Extra right padding so text doesn't sit under the icon
            isPicker && "pr-10",
            // Hide the native calendar indicator (invisible/inconsistent on mobile)
            isPicker &&
              "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-y-0 [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
            className
          )}
          {...props}
        />

        {isPicker && (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={openPicker}
            className="pointer-events-auto absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-foreground/70 transition hover:bg-muted hover:text-foreground"
          >
            <Calendar size={16} strokeWidth={1.9} />
          </button>
        )}
      </div>
    </label>
  );
}