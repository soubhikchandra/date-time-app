// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Calendar as CalendarIcon, X } from "lucide-react";
// import { format } from "date-fns";
// import { Calendar } from "./calendar";
// import { cn } from "@/lib/utils";
// import type { Matcher } from "react-day-picker";

// interface DatePickerProps {
//   label?: string;
//   hint?: string;
//   name?: string;
//   value: string;                // ISO "yyyy-MM-dd" or ""
//   onChange: (value: string) => void;
//   placeholder?: string;
//   className?: string;
//   disabled?: boolean;
//   min?: string;                 // ISO "yyyy-MM-dd"
//   max?: string;                 // ISO "yyyy-MM-dd"
// }

// function isoToDate(iso: string): Date | undefined {
//   if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined;
//   const d = new Date(`${iso}T12:00:00`);
//   return Number.isNaN(d.getTime()) ? undefined : d;
// }

// function dateToIso(d: Date | undefined): string {
//   if (!d) return "";
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// }

// export function DatePicker({
//   label,
//   hint,
//   name,
//   value,
//   onChange,
//   placeholder = "Pick a date",
//   className,
//   disabled,
//   min,
//   max,
// }: DatePickerProps) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement>(null);
//   const id = name || label;

//   const selected = isoToDate(value);

//   // Build disabled matchers from min/max
//   const disabledMatchers: Matcher[] = [];
//   const minDate = isoToDate(min ?? "");
//   const maxDate = isoToDate(max ?? "");
//   if (minDate) disabledMatchers.push({ before: minDate });
//   if (maxDate) disabledMatchers.push({ after: maxDate });

//   // Close on outside click
//   useEffect(() => {
//     const onDown = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     };
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setOpen(false);
//     };
//     document.addEventListener("mousedown", onDown);
//     document.addEventListener("keydown", onKey);
//     return () => {
//       document.removeEventListener("mousedown", onDown);
//       document.removeEventListener("keydown", onKey);
//     };
//   }, []);

//   const handleSelect = (d: Date | undefined) => {
//     onChange(dateToIso(d));
//     setOpen(false);
//   };

//   const clear = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     onChange("");
//     setOpen(false);
//   };

//   return (
//     <div ref={ref} className="relative">
//       {label && (
//         <label
//           htmlFor={id}
//           className="mb-2 flex items-baseline justify-between gap-3 text-sm font-bold text-foreground"
//         >
//           <span>{label}</span>
//           {hint && (
//             <span className="font-normal text-muted-foreground">{hint}</span>
//           )}
//         </label>
//       )}

//       {/* Trigger button — looks like the Input */}
//       <button
//         id={id}
//         type="button"
//         disabled={disabled}
//         onClick={() => setOpen((v) => !v)}
//         className={cn(
//           "flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background/70 px-3.5 text-left text-sm text-foreground shadow-sm transition",
//           "hover:border-primary/40 focus:border-primary focus:outline-none",
//           "disabled:cursor-not-allowed disabled:opacity-50",
//           !selected && "text-muted-foreground/60",
//           className
//         )}
//       >
//         <span className="truncate">
//           {selected ? format(selected, "dd-MM-yyyy") : placeholder}
//         </span>

//         <span className="flex items-center gap-1.5">
//           {selected && !disabled && (
//             <span
//               role="button"
//               tabIndex={-1}
//               onClick={clear}
//               aria-label="Clear date"
//               className="grid size-5 place-items-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground"
//             >
//               <X size={12} />
//             </span>
//           )}
//           <CalendarIcon
//             size={16}
//             strokeWidth={1.9}
//             className="shrink-0 text-muted-foreground"
//           />
//         </span>
//       </button>

//       {/* Popover */}
//       {open && (
//         <div className="result-pop absolute left-0 top-full z-50 mt-2 rounded-2xl border border-border bg-card shadow-xl">
//           <Calendar
//             mode="single"
//             selected={selected}
//             onSelect={handleSelect}
//             defaultMonth={selected ?? new Date()}
//             disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
//           />
//         </div>
//       )}
//     </div>
//   );
// }