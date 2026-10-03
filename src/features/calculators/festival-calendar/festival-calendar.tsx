// // src/features/calculators/festival-calendar/festival-calendar.tsx
// "use client";

// import { useMemo, useState, useTransition } from "react";
// import {
//   format,
//   startOfMonth,
//   endOfMonth,
//   startOfWeek,
//   endOfWeek,
//   eachDayOfInterval,
//   isSameMonth,
//   isToday,
//   addMonths,
//   startOfYear,
// } from "date-fns";
// import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
// import { SearchableSelect } from "@/components/ui/searchable-select";
// import { ToolCardHeader } from "@/components/ui/tool-card-header";
// import { cn } from "@/lib/utils";
// import {
//   ALL_RELIGIONS,
//   MONTH_OPTIONS,
//   RELIGION_META,
//   getFestivalsForReligions,
//   getCountryOptions,
//   getStateOptions,
//   type FestivalItem,
//   type Religion,
// } from "./logic";

// const TOOL_SLUG = "festival-calendar";
// const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
// const MONTHS_PER_PAGE = 3;

// /* ------------------------------------------------------------------ */
// /*  Mini Month — with per-month religion breakdown                     */
// /* ------------------------------------------------------------------ */

// function MiniMonth({
//   monthDate,
//   festivals,
//   selectedReligions,
// }: {
//   monthDate: Date;
//   festivals: FestivalItem[];
//   selectedReligions: Set<Religion>;
// }) {
//   const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
//   const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });
//   const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

//   // Build a lookup of festivals per day (React Compiler auto-memoizes)
//   const byDay = new Map<string, FestivalItem[]>();
//   festivals
//     .filter((f) => selectedReligions.has(f.religion))
//     .forEach((f) => {
//       const key = format(f.date, "yyyy-MM-dd");
//       if (!byDay.has(key)) byDay.set(key, []);
//       byDay.get(key)!.push(f);
//     });

//   // Religion breakdown for THIS month only
//   const monthCounts = new Map<Religion, number>();
//   festivals
//     .filter((f) => selectedReligions.has(f.religion))
//     .filter(
//       (f) =>
//         f.date.getFullYear() === monthDate.getFullYear() &&
//         f.date.getMonth() === monthDate.getMonth()
//     )
//     .forEach((f) => {
//       monthCounts.set(f.religion, (monthCounts.get(f.religion) ?? 0) + 1);
//     });

//   const monthStats = Array.from(monthCounts.entries()).sort(
//     (a, b) => b[1] - a[1]
//   );

//   const totalInMonth = monthStats.reduce((sum, [, c]) => sum + c, 0);

//   return (
//     <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
//       {/* Header with total count */}
//       <div className="flex items-center justify-between gap-2">
//         <p className="text-[13px] font-bold text-[var(--text-primary)]">
//           {format(monthDate, "MMMM")}
//         </p>
//         {totalInMonth > 0 && (
//           <span className="rounded-full bg-[var(--surface-btn-secondary)] px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
//             {totalInMonth}
//           </span>
//         )}
//       </div>

//       {/* Calendar grid */}
//       <div className="grid grid-cols-7 gap-1 text-center">
//         {WEEKDAYS.map((d, i) => (
//           <span
//             key={i}
//             className="py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
//           >
//             {d}
//           </span>
//         ))}

//         {days.map((day) => {
//           const key = format(day, "yyyy-MM-dd");
//           const inMonth = isSameMonth(day, monthDate);
//           const today = isToday(day);
//           const items = byDay.get(key) ?? [];
//           const uniqueReligions = Array.from(
//             new Set(items.map((i) => i.religion))
//           );

//           return (
//             <div
//               key={key}
//               title={items.map((i) => i.name).join("\n")}
//               className={cn(
//                 "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md text-[11px] transition",
//                 !inMonth && "text-muted-foreground/20",
//                 inMonth &&
//                   !today &&
//                   items.length === 0 &&
//                   "text-[var(--text-primary)]",
//                 inMonth && today && "bg-orange-400 font-bold text-white",
//                 inMonth &&
//                   items.length > 0 &&
//                   !today &&
//                   "bg-[var(--surface-btn-secondary)] font-semibold"
//               )}
//             >
//               <span>{format(day, "d")}</span>
//               {inMonth && uniqueReligions.length > 0 && (
//                 <span className="flex gap-0.5">
//                   {uniqueReligions.slice(0, 3).map((r) => (
//                     <span
//                       key={r}
//                       className={cn(
//                         "size-[5px] rounded-full",
//                         RELIGION_META[r].dot
//                       )}
//                     />
//                   ))}
//                 </span>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Per-month religion legend strip */}
//       {monthStats.length > 0 ? (
//         <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-[var(--border-card)] pt-2">
//           {monthStats.map(([religion, count]) => {
//             const meta = RELIGION_META[religion];
//             return (
//               <span
//                 key={religion}
//                 className="inline-flex items-center gap-1 text-[9px] font-medium text-muted-foreground"
//                 title={`${meta.label}: ${count} festival${count === 1 ? "" : "s"}`}
//               >
//                 <span className={cn("size-1.5 rounded-full", meta.dot)} />
//                 <span className="text-[var(--text-primary)] opacity-80">
//                   {meta.label}
//                 </span>
//                 <span className="text-muted-foreground">{count}</span>
//               </span>
//             );
//           })}
//         </div>
//       ) : (
//         <p className="border-t border-[var(--border-card)] pt-2 text-[9px] text-muted-foreground">
//           No festivals
//         </p>
//       )}
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Main                                                               */
// /* ------------------------------------------------------------------ */

// export function FestivalCalendar() {
//   const countryOptions = useMemo(() => getCountryOptions(), []);
//   const [country, setCountry] = useState("IN");
//   const [state, setState] = useState("");
//   const [year, setYear] = useState(new Date().getFullYear());
//   const [monthFilter, setMonthFilter] = useState<string>("all");
//   const [monthPage, setMonthPage] = useState(0);
//   const [selectedReligions, setSelectedReligions] = useState<Set<Religion>>(
//     new Set(ALL_RELIGIONS)
//   );

//   const [isPending, startTransition] = useTransition();

//   const stateOptions = useMemo(() => getStateOptions(country), [country]);

//   const yearOptions = useMemo(() => {
//     const current = new Date().getFullYear();
//     return Array.from({ length: 21 }, (_, i) => ({
//       value: String(current - 10 + i),
//       label: String(current - 10 + i),
//     }));
//   }, []);

//   /* Festivals — cached + skip-disabled */
//   const allFestivals = useMemo(
//     () =>
//       getFestivalsForReligions(
//         country,
//         year,
//         selectedReligions,
//         state || undefined
//       ),
//     [country, year, state, selectedReligions]
//   );

//   /* Apply month filter */
//   const festivals = useMemo(() => {
//     if (monthFilter === "all") return allFestivals;
//     const targetMonth = Number(monthFilter);
//     return allFestivals.filter((f) => f.date.getMonth() === targetMonth);
//   }, [allFestivals, monthFilter]);

//   /* 12 months for grid */
//   const monthsInYear = useMemo(() => {
//     const start = startOfYear(new Date(year, 0, 1));
//     return Array.from({ length: 12 }, (_, i) => addMonths(start, i));
//   }, [year]);

//   /* Which months to render */
//   const visibleMonths = useMemo(() => {
//     if (monthFilter !== "all") {
//       return [monthsInYear[Number(monthFilter)]];
//     }
//     const start = monthPage * MONTHS_PER_PAGE;
//     return monthsInYear.slice(start, start + MONTHS_PER_PAGE);
//   }, [monthsInYear, monthPage, monthFilter]);

//   const totalPages = Math.ceil(monthsInYear.length / MONTHS_PER_PAGE);

//   /* Counts */
//   const countByReligion = useMemo(() => {
//     const counts: Record<Religion, number> = {
//       christian: 0,
//       islamic: 0,
//       hindu: 0,
//       jewish: 0,
//       buddhist: 0,
//       "east-asian": 0,
//       secular: 0,
//     };
//     allFestivals.forEach((f) => counts[f.religion]++);
//     return counts;
//   }, [allFestivals]);

//   const toggleReligion = (r: Religion) => {
//     startTransition(() => {
//       setSelectedReligions((prev) => {
//         const next = new Set(prev);
//         if (next.has(r)) next.delete(r);
//         else next.add(r);
//         return next;
//       });
//     });
//   };

//   const toggleAll = () => {
//     startTransition(() => {
//       setSelectedReligions((prev) =>
//         prev.size === ALL_RELIGIONS.length
//           ? new Set()
//           : new Set(ALL_RELIGIONS)
//       );
//     });
//   };

//   return (
//     <div className="space-y-4">
//       <section className="tool-card rounded-3xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 sm:p-7">
//         <ToolCardHeader slug={TOOL_SLUG} />

//         {/* Row 1: Country / State / Year / Month */}
//         <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
//           <SearchableSelect
//             label="Country"
//             value={country}
//             onChange={(v) => {
//               startTransition(() => {
//                 setCountry(v);
//                 setState("");
//               });
//             }}
//             options={countryOptions}
//             placeholder="Country..."
//           />

//           {stateOptions.length > 0 && (
//             <SearchableSelect
//               label="State / Province"
//               value={state}
//               onChange={(v) => startTransition(() => setState(v))}
//               options={stateOptions}
//               placeholder="All states"
//             />
//           )}

//           <SearchableSelect
//             label="Year"
//             value={String(year)}
//             onChange={(v) => startTransition(() => setYear(Number(v)))}
//             options={yearOptions}
//           />

//           <SearchableSelect
//             label="Month"
//             value={monthFilter}
//             onChange={(v) => {
//               startTransition(() => {
//                 setMonthFilter(v);
//                 setMonthPage(0);
//               });
//             }}
//             options={MONTH_OPTIONS}
//             placeholder="All months"
//           />
//         </div>

// {/* Row 2: Religion chips */}
// <div className="mt-5">
//   <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
//     Select any religion to see festival dates
//     {isPending && (
//       <Loader2 size={11} className="animate-spin text-[var(--purple)]" />
//     )}
//   </p>

//   <div className="flex flex-wrap items-center gap-2">
//     {/* Religion chips */}
//     {ALL_RELIGIONS.map((r) => {
//       const meta = RELIGION_META[r];
//       const active = selectedReligions.has(r);

//       return (
//         <button
//           key={r}
//           type="button"
//           onClick={() => toggleReligion(r)}
//           aria-pressed={active}
//           className={cn(
//             "group inline-flex cursor-pointer select-none items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-bold transition-all duration-150",
//             "hover:-translate-y-px active:translate-y-0 active:scale-[.98]",
//             "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)]/50",
//             active
//               ? cn("shadow-sm", meta.bg, meta.text)
//               : "bg-[var(--surface-btn-secondary)] text-muted-foreground opacity-55 hover:opacity-80"
//           )}
//         >
//           <span
//             className={cn(
//               "grid size-4 shrink-0 place-items-center rounded-full transition",
//               active
//                 ? cn("text-white", meta.dot)
//                 : "border-2 border-current bg-transparent"
//             )}
//           >
//             {active && (
//               <svg
//                 width="9"
//                 height="9"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="white"
//                 strokeWidth="4"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <polyline points="20 6 9 17 4 12" />
//               </svg>
//             )}
//           </span>

//           <span>{meta.label}</span>
//         </button>
//       );
//     })}

//     {/* Select all / Clear all — now at the end of the chip row */}
//     <button
//       type="button"
//       onClick={toggleAll}
//       className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border-2 border-[var(--purple)]/40 bg-transparent px-3.5 py-2 text-[12px] font-bold text-[var(--purple)] transition-all duration-150 hover:border-[var(--purple)] hover:bg-[var(--purple)]/10 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)]/50"
//     >
//       {selectedReligions.size === ALL_RELIGIONS.length ? (
//         <>
//           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
//             <line x1="18" y1="6" x2="6" y2="18" />
//             <line x1="6" y1="6" x2="18" y2="18" />
//           </svg>
//           Clear all
//         </>
//       ) : (
//         <>
//           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
//             <polyline points="20 6 9 17 4 12" />
//           </svg>
//           Select all
//         </>
//       )}
//     </button>
//   </div>
// </div>
//         {/* Calendar grid */}
//         <div className="mt-6 flex flex-col gap-4">
//           <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-[var(--border-card)] dark:bg-[var(--surface-btn-secondary)] sm:p-4">
//             <div
//               className={cn(
//                 "grid gap-3",
//                 monthFilter === "all"
//                   ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
//                   : "grid-cols-1 max-w-md mx-auto",
//                 isPending && "opacity-60"
//               )}
//             >
//               {visibleMonths.map((m) => (
//                 <MiniMonth
//                   key={m.toISOString()}
//                   monthDate={m}
//                   festivals={festivals}
//                   selectedReligions={selectedReligions}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Pagination — only in "All months" mode */}
//           {monthFilter === "all" && totalPages > 1 && (
//             <div className="flex items-center justify-between gap-3">
//               <button
//                 type="button"
//                 onClick={() => setMonthPage((p) => Math.max(0, p - 1))}
//                 disabled={monthPage === 0}
//                 className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] px-3 py-1.5 text-[12px] font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface-btn-secondary)] disabled:opacity-40"
//               >
//                 <ChevronLeft size={14} />
//                 Previous
//               </button>

//               <div className="flex items-center gap-1.5">
//                 {Array.from({ length: totalPages }, (_, i) => (
//                   <button
//                     key={i}
//                     type="button"
//                     onClick={() => setMonthPage(i)}
//                     className={cn(
//                       "h-2 rounded-full transition",
//                       monthPage === i
//                         ? "w-5 bg-[var(--purple)]"
//                         : "w-2 bg-[var(--border-card)] hover:bg-[var(--purple)]/40"
//                     )}
//                     aria-label={`Page ${i + 1}`}
//                   />
//                 ))}
//               </div>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setMonthPage((p) => Math.min(totalPages - 1, p + 1))
//                 }
//                 disabled={monthPage === totalPages - 1}
//                 className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] px-3 py-1.5 text-[12px] font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface-btn-secondary)] disabled:opacity-40"
//               >
//                 Next
//                 <ChevronRight size={14} />
//               </button>
//             </div>
//           )}

//           {/* Legend */}
//           <div className="flex flex-wrap gap-x-5 gap-y-2">
//             {ALL_RELIGIONS.map((r) => (
//               <span
//                 key={r}
//                 className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
//               >
//                 <span
//                   className={cn("size-2.5 rounded-full", RELIGION_META[r].dot)}
//                 />
//                 {RELIGION_META[r].label}
//               </span>
//             ))}
//           </div>

//           {/* Festival list — compact grid */}
//           <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
//             <p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
//               {monthFilter === "all"
//                 ? `${year} Festivals (${festivals.length})`
//                 : `${MONTH_OPTIONS[Number(monthFilter) + 1]?.label} ${year} (${festivals.length})`}
//             </p>

//             {festivals.length === 0 ? (
//               <p className="text-[13px] text-muted-foreground">
//                 No festivals match your current filters.
//               </p>
//             ) : (
//               <div
//                 className={cn(
//                   "grid gap-2.5 max-h-[560px] overflow-y-auto pr-1",
//                   "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
//                   "[&::-webkit-scrollbar]:w-1.5",
//                   "[&::-webkit-scrollbar-thumb]:rounded-full",
//                   "[&::-webkit-scrollbar-thumb]:bg-[var(--border-card)]"
//                 )}
//               >
//                 {festivals.map((f) => {
//                   const meta = RELIGION_META[f.religion];
//                   return (
//                     <div
//                       key={`${f.dateString}-${f.name}-${f.source}`}
//                       className="group flex flex-col justify-between gap-2.5 rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-3 transition hover:border-[var(--purple)]/40 hover:bg-[var(--surface-card)]"
//                     >
//                       {/* Top row: date chip + weekday + religion pill */}
//                       <div className="flex items-start justify-between gap-2">
//                         <div className="flex items-center gap-2">
//                           <div
//                             className={cn(
//                               "flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[var(--surface-card)]",
//                               "border border-[var(--border-card)]"
//                             )}
//                           >
//                             <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
//                               {format(f.date, "MMM")}
//                             </span>
//                             <span className="text-[14px] font-bold text-[var(--text-primary)] leading-tight">
//                               {format(f.date, "d")}
//                             </span>
//                           </div>
//                           <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
//                             {format(f.date, "EEE")}
//                           </span>
//                         </div>

//                         <span
//                           className={cn(
//                             "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold",
//                             meta.bg,
//                             meta.text
//                           )}
//                         >
//                           {meta.label.split(" ")[0]}
//                         </span>
//                       </div>

//                       {/* Festival name — wraps naturally */}
//                       <p className="text-[13px] font-semibold leading-snug text-[var(--text-primary)] break-words">
//                         {f.name}
//                       </p>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }


// src/features/calculators/festival-calendar/festival-calendar.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  startOfYear,
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { cn } from "@/lib/utils";
import {
  ALL_RELIGIONS,
  MONTH_OPTIONS,
  RELIGION_META,
  getFestivalsForReligions,
  getCountryOptions,
  getStateOptions,
  type FestivalItem,
  type Religion,
} from "./logic";

const TOOL_SLUG = "festival-calendar";
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS_PER_PAGE = 3;

/* ------------------------------------------------------------------ */
/*  Mini Month — with per-month religion breakdown                     */
/* ------------------------------------------------------------------ */

function MiniMonth({
  monthDate,
  festivals,
  selectedReligions,
}: {
  monthDate: Date;
  festivals: FestivalItem[];
  selectedReligions: Set<Religion>;
}) {
  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Build a lookup of festivals per day (React Compiler auto-memoizes)
  const byDay = new Map<string, FestivalItem[]>();
  festivals
    .filter((f) => selectedReligions.has(f.religion))
    .forEach((f) => {
      const key = format(f.date, "yyyy-MM-dd");
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(f);
    });

  // Religion breakdown for THIS month only
  const monthCounts = new Map<Religion, number>();
  festivals
    .filter((f) => selectedReligions.has(f.religion))
    .filter(
      (f) =>
        f.date.getFullYear() === monthDate.getFullYear() &&
        f.date.getMonth() === monthDate.getMonth()
    )
    .forEach((f) => {
      monthCounts.set(f.religion, (monthCounts.get(f.religion) ?? 0) + 1);
    });

  const monthStats = Array.from(monthCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  const totalInMonth = monthStats.reduce((sum, [, c]) => sum + c, 0);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
      {/* Header with total count */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-bold text-[var(--text-primary)]">
          {format(monthDate, "MMMM")}
        </p>
        {totalInMonth > 0 && (
          <span className="rounded-full bg-[var(--surface-btn-secondary)] px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
            {totalInMonth}
          </span>
        )}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <span
            key={i}
            className="py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </span>
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, monthDate);
          const today = isToday(day);
          const items = byDay.get(key) ?? [];
          const uniqueReligions = Array.from(
            new Set(items.map((i) => i.religion))
          );

          return (
            <div
              key={key}
              title={items.map((i) => i.name).join("\n")}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md text-[11px] transition",
                !inMonth && "text-muted-foreground/20",
                inMonth &&
                  !today &&
                  items.length === 0 &&
                  "text-[var(--text-primary)]",
                inMonth && today && "bg-orange-400 font-bold text-white",
                inMonth &&
                  items.length > 0 &&
                  !today &&
                  "bg-[var(--surface-btn-secondary)] font-semibold"
              )}
            >
              <span>{format(day, "d")}</span>
              {inMonth && uniqueReligions.length > 0 && (
                <span className="flex gap-0.5">
                  {uniqueReligions.slice(0, 3).map((r) => (
                    <span
                      key={r}
                      className={cn(
                        "size-[5px] rounded-full",
                        RELIGION_META[r].dot
                      )}
                    />
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Per-month religion legend strip */}
      {monthStats.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-[var(--border-card)] pt-2">
          {monthStats.map(([religion, count]) => {
            const meta = RELIGION_META[religion];
            return (
              <span
                key={religion}
                className="inline-flex items-center gap-1 text-[9px] font-medium text-muted-foreground"
                title={`${meta.label}: ${count} festival${count === 1 ? "" : "s"}`}
              >
                <span className={cn("size-1.5 rounded-full", meta.dot)} />
                <span className="text-[var(--text-primary)] opacity-80">
                  {meta.label}
                </span>
                <span className="text-muted-foreground">{count}</span>
              </span>
            );
          })}
        </div>
      ) : (
        <p className="border-t border-[var(--border-card)] pt-2 text-[9px] text-muted-foreground">
          No festivals
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export function FestivalCalendar() {
  const countryOptions = useMemo(() => getCountryOptions(), []);
  const [country, setCountry] = useState("IN");
  const [state, setState] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [monthPage, setMonthPage] = useState(0);
  const [selectedReligions, setSelectedReligions] = useState<Set<Religion>>(
    new Set(ALL_RELIGIONS)
  );

  const [isPending, startTransition] = useTransition();

  const stateOptions = useMemo(() => getStateOptions(country), [country]);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => ({
      value: String(current - 10 + i),
      label: String(current - 10 + i),
    }));
  }, []);

  /* Festivals — cached + skip-disabled */
  const allFestivals = useMemo(
    () =>
      getFestivalsForReligions(
        country,
        year,
        selectedReligions,
        state || undefined
      ),
    [country, year, state, selectedReligions]
  );

  /* Apply month filter */
  const festivals = useMemo(() => {
    if (monthFilter === "all") return allFestivals;
    const targetMonth = Number(monthFilter);
    return allFestivals.filter((f) => f.date.getMonth() === targetMonth);
  }, [allFestivals, monthFilter]);

  /* 12 months for grid */
  const monthsInYear = useMemo(() => {
    const start = startOfYear(new Date(year, 0, 1));
    return Array.from({ length: 12 }, (_, i) => addMonths(start, i));
  }, [year]);

  /* Which months to render */
  const visibleMonths = useMemo(() => {
    if (monthFilter !== "all") {
      return [monthsInYear[Number(monthFilter)]];
    }
    const start = monthPage * MONTHS_PER_PAGE;
    return monthsInYear.slice(start, start + MONTHS_PER_PAGE);
  }, [monthsInYear, monthPage, monthFilter]);

  const totalPages = Math.ceil(monthsInYear.length / MONTHS_PER_PAGE);

  const toggleReligion = (r: Religion) => {
    startTransition(() => {
      setSelectedReligions((prev) => {
        const next = new Set(prev);
        if (next.has(r)) next.delete(r);
        else next.add(r);
        return next;
      });
    });
  };

  const toggleAll = () => {
    startTransition(() => {
      setSelectedReligions((prev) =>
        prev.size === ALL_RELIGIONS.length
          ? new Set()
          : new Set(ALL_RELIGIONS)
      );
    });
  };

  return (
    <div className="space-y-4">
      <section className="tool-card rounded-3xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 sm:p-7">
        <ToolCardHeader slug={TOOL_SLUG} />

        {/* Row 1: Country / State / Year / Month */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SearchableSelect
            label="Country"
            value={country}
            onChange={(v) => {
              startTransition(() => {
                setCountry(v);
                setState("");
              });
            }}
            options={countryOptions}
            placeholder="Country..."
          />

          {stateOptions.length > 0 && (
            <SearchableSelect
              label="State / Province"
              value={state}
              onChange={(v) => startTransition(() => setState(v))}
              options={stateOptions}
              placeholder="All states"
            />
          )}

          <SearchableSelect
            label="Year"
            value={String(year)}
            onChange={(v) => startTransition(() => setYear(Number(v)))}
            options={yearOptions}
          />

          <SearchableSelect
            label="Month"
            value={monthFilter}
            onChange={(v) => {
              startTransition(() => {
                setMonthFilter(v);
                setMonthPage(0);
              });
            }}
            options={MONTH_OPTIONS}
            placeholder="All months"
          />
        </div>

        {/* Row 2: Religion chips */}
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
            Select any religion to see festival dates
            {isPending && (
              <Loader2
                size={11}
                className="animate-spin text-[var(--purple)]"
              />
            )}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {/* Religion toggle chips */}
            {ALL_RELIGIONS.map((r) => {
              const meta = RELIGION_META[r];
              const active = selectedReligions.has(r);

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleReligion(r)}
                  aria-pressed={active}
                  className={cn(
                    "group inline-flex cursor-pointer select-none items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-bold transition-all duration-150",
                    "hover:-translate-y-px active:translate-y-0 active:scale-[.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)]/50",
                    active
                      ? cn("shadow-sm", meta.bg, meta.text)
                      : "bg-[var(--surface-btn-secondary)] text-muted-foreground opacity-55 hover:opacity-80"
                  )}
                >
                  {/* Toggle indicator — checkmark when on, hollow circle when off */}
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-full transition",
                      active
                        ? cn("text-white", meta.dot)
                        : "border-2 border-current bg-transparent"
                    )}
                  >
                    {active && (
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>

                  <span>{meta.label}</span>
                </button>
              );
            })}

            {/* Select all / Clear all — at the end of the chip row */}
            <button
              type="button"
              onClick={toggleAll}
              className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border-2 border-[var(--purple)]/40 bg-transparent px-3.5 py-2 text-[12px] font-bold text-[var(--purple)] transition-all duration-150 hover:border-[var(--purple)] hover:bg-[var(--purple)]/10 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple)]/50"
            >
              {selectedReligions.size === ALL_RELIGIONS.length ? (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Clear all
                </>
              ) : (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Select all
                </>
              )}
            </button>
          </div>

          {/* Summary line below chips */}
          <p className="mt-2 text-[10px] text-muted-foreground">
            {allFestivals.length} festivals found · {selectedReligions.size} of{" "}
            {ALL_RELIGIONS.length} religions active
          </p>
        </div>

        {/* Calendar grid */}
        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-[var(--border-card)] dark:bg-[var(--surface-btn-secondary)] sm:p-4">
            <div
              className={cn(
                "grid gap-3",
                monthFilter === "all"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 max-w-md mx-auto",
                isPending && "opacity-60"
              )}
            >
              {visibleMonths.map((m) => (
                <MiniMonth
                  key={m.toISOString()}
                  monthDate={m}
                  festivals={festivals}
                  selectedReligions={selectedReligions}
                />
              ))}
            </div>
          </div>

          {/* Pagination — only in "All months" mode */}
          {monthFilter === "all" && totalPages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMonthPage((p) => Math.max(0, p - 1))}
                disabled={monthPage === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] px-3 py-1.5 text-[12px] font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface-btn-secondary)] disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMonthPage(i)}
                    className={cn(
                      "h-2 rounded-full transition",
                      monthPage === i
                        ? "w-5 bg-[var(--purple)]"
                        : "w-2 bg-[var(--border-card)] hover:bg-[var(--purple)]/40"
                    )}
                    aria-label={`Page ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setMonthPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={monthPage === totalPages - 1}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] px-3 py-1.5 text-[12px] font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface-btn-secondary)] disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {ALL_RELIGIONS.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
              >
                <span
                  className={cn("size-2.5 rounded-full", RELIGION_META[r].dot)}
                />
                {RELIGION_META[r].label}
              </span>
            ))}
          </div>

          {/* Festival list — compact grid */}
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
              {monthFilter === "all"
                ? `${year} Festivals (${festivals.length})`
                : `${MONTH_OPTIONS[Number(monthFilter) + 1]?.label} ${year} (${festivals.length})`}
            </p>

            {festivals.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                No festivals match your current filters.
              </p>
            ) : (
              <div
                className={cn(
                  "grid gap-2.5 max-h-[560px] overflow-y-auto pr-1",
                  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                  "[&::-webkit-scrollbar]:w-1.5",
                  "[&::-webkit-scrollbar-thumb]:rounded-full",
                  "[&::-webkit-scrollbar-thumb]:bg-[var(--border-card)]"
                )}
              >
                {festivals.map((f) => {
                  const meta = RELIGION_META[f.religion];
                  return (
                    <div
                      key={`${f.dateString}-${f.name}-${f.source}`}
                      className="group flex flex-col justify-between gap-2.5 rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-3 transition hover:border-[var(--purple)]/40 hover:bg-[var(--surface-card)]"
                    >
                      {/* Top row: date chip + weekday + religion pill */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[var(--surface-card)]",
                              "border border-[var(--border-card)]"
                            )}
                          >
                            <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
                              {format(f.date, "MMM")}
                            </span>
                            <span className="text-[14px] font-bold text-[var(--text-primary)] leading-tight">
                              {format(f.date, "d")}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {format(f.date, "EEE")}
                          </span>
                        </div>

                        <span
                          className={cn(
                            "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                            meta.bg,
                            meta.text
                          )}
                        >
                          {meta.label.split(" ")[0]}
                        </span>
                      </div>

                      {/* Festival name — wraps naturally */}
                      <p className="text-[13px] font-semibold leading-snug text-[var(--text-primary)] break-words">
                        {f.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}