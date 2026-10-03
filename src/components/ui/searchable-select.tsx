// // src/components/ui/searchable-select.tsx
// "use client";

// import { useState, useMemo, useRef, useEffect } from "react";
// import { ChevronDown, Search } from "lucide-react";
// import { cn } from "@/lib/utils";

// export interface SelectOption {
//   value: string;
//   label: string;
// }

// interface SearchableSelectProps {
//   label?: string;
//   value: string;
//   onChange: (value: string) => void;
//   options: SelectOption[];
//   placeholder?: string;
//   disabled?: boolean;
// }

// export function SearchableSelect({
//   label,
//   value,
//   onChange,
//   options,
//   placeholder = "Select...",
//   disabled = false,
// }: SearchableSelectProps) {
//   const [open, setOpen] = useState(false);
//   const [query, setQuery] = useState("");
//   const ref = useRef<HTMLDivElement>(null);

//   // Close when clicking outside
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   // Filter options by search query
//   const filtered = useMemo(() => {
//     if (!query.trim()) return options;
//     const q = query.toLowerCase();
//     return options.filter((o) => o.label.toLowerCase().includes(q));
//   }, [options, query]);

//   const selected = options.find((o) => o.value === value);

//   return (
//     <div ref={ref} className="relative">
//       {label && (
//         <label className="mb-1.5 block text-[13px] font-semibold text-[var(--text-primary)]">
//           {label}
//         </label>
//       )}

//       <button
//         type="button"
//         onClick={() => !disabled && setOpen((o) => !o)}
//         disabled={disabled}
//         className={cn(
//           "flex h-[42px] w-full items-center justify-between gap-2 rounded-[10px] px-3.5 text-left text-[14px] outline-none transition",
//           "bg-[var(--surface-input)] text-[var(--text-input)]",
//           "border border-[var(--border-input)]",
//           "hover:border-[var(--purple)]/40",
//           open && "border-[var(--purple)] ring-2 ring-[var(--purple)]/15",
//           disabled && "cursor-not-allowed opacity-50"
//         )}
//       >
//         <span className={cn("truncate", !selected && "text-muted-foreground")}>
//           {selected?.label ?? placeholder}
//         </span>
//         <ChevronDown
//           size={14}
//           className={cn("shrink-0 opacity-60 transition-transform", open && "rotate-180")}
//         />
//       </button>

//       {open && (
//         <div
//           className={cn(
//             "absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl",
//             "border border-[var(--border-card)] bg-[var(--surface-card)]",
//             "shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
//           )}
//         >
//           {/* Search input */}
//           <div className="relative border-b border-[var(--border-card)] p-2">
//             <Search
//               size={13}
//               className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
//             />
//             <input
//               autoFocus
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search..."
//               className={cn(
//                 "h-8 w-full rounded-md bg-transparent pl-7 pr-2 text-[13px] outline-none",
//                 "text-[var(--text-primary)] placeholder:text-muted-foreground"
//               )}
//             />
//           </div>

//           {/* Options */}
//           <ul className="max-h-[220px] overflow-y-auto p-1">
//             {filtered.length === 0 ? (
//               <li className="px-2 py-1.5 text-xs text-muted-foreground">No results found</li>
//             ) : (
//               filtered.map((o) => (
//                 <li key={o.value}>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       onChange(o.value);
//                       setOpen(false);
//                       setQuery("");
//                     }}
//                     className={cn(
//                       "w-full rounded-md px-2.5 py-1.5 text-left text-[13px] transition",
//                       "text-[var(--text-primary)] hover:bg-[var(--surface-btn-secondary)]",
//                       o.value === value &&
//                         "bg-[var(--purple)]/10 font-semibold text-[var(--purple)]"
//                     )}
//                   >
//                     {o.label}
//                   </button>
//                 </li>
//               ))
//             )}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// src/components/ui/searchable-select.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter options by search query
  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="mb-1.5 block text-[13px] font-semibold text-[var(--text-primary)]">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={cn(
          "flex h-[42px] w-full items-center justify-between gap-2 rounded-[10px] px-3.5 text-left text-[14px] outline-none transition",
          "bg-[var(--surface-input)] text-[var(--text-input)]",
          "border border-[var(--border-input)]",
          "hover:border-[var(--purple)]/40",
          open && "border-[var(--purple)] ring-2 ring-[var(--purple)]/15",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn("shrink-0 opacity-60 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl",
            "border border-[var(--border-card)] bg-[var(--surface-card)]",
            "shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
          )}
        >
          {/* Search input */}
          <div className="relative border-b border-[var(--border-card)] p-2">
            <Search
              size={13}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className={cn(
                "h-8 w-full rounded-md bg-transparent pl-7 pr-2 text-[13px] outline-none",
                "text-[var(--text-primary)] placeholder:text-muted-foreground"
              )}
            />
          </div>

          {/* Options */}
          <ul className="max-h-[220px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-2 py-1.5 text-xs text-muted-foreground">No results found</li>
            ) : (
              filtered.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "w-full rounded-md px-2.5 py-1.5 text-left text-[13px] transition",
                      "text-[var(--text-primary)] hover:bg-[var(--surface-btn-secondary)]",
                      o.value === value &&
                        "bg-[var(--purple)]/10 font-semibold text-[var(--purple)]"
                    )}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}