import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options?: SelectOption[];   // flat list
  groups?: SelectGroup[];     // grouped list (takes precedence)
}

export function Select({
  label,
  hint,
  options,
  groups,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || props.name;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={selectId}
          className="flex items-baseline justify-between gap-3 text-sm font-bold text-foreground"
        >
          <span>{label}</span>
          {hint && (
            <span className="font-normal text-muted-foreground">{hint}</span>
          )}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-input bg-background/70 px-3.5 pr-10 text-sm text-foreground shadow-sm transition",
            "focus:border-primary focus:outline-none",
            "color-scheme-light dark:color-scheme-dark",
            className
          )}
          {...props}
        >
          {groups
            ? groups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ))
            : options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
        </select>

        <ChevronDown
          size={16}
          strokeWidth={1.9}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </div>
  );
}