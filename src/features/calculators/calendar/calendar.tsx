// // src/features/calculators/calendar/calendar.tsx
// "use client";

// import { useState, useMemo } from "react";
// import { DayPicker } from "react-day-picker";
// import "react-day-picker/dist/style.css";
// import {
//   format,
//   startOfMonth,
//   endOfMonth,
//   startOfWeek,
//   endOfWeek,
//   eachDayOfInterval,
//   isSameMonth,
//   isSameDay,
//   isToday,
//   addMonths,
//   startOfYear,
// } from "date-fns";
// import {
//   CalendarDays,
//   LayoutGrid,
//   Sunrise,
//   Sunset,
//   Sun,
//   Moon,
//   // Calendar,
// } from "lucide-react";
// import { ToolCardHeader } from "@/components/ui/tool-card-header";
// import { ResultPanel } from "@/components/ui/result-card";
// import { SearchableSelect } from "@/components/ui/searchable-select";
// import { cn } from "@/lib/utils";
// import {
//   getHolidays,
//   getCountryOptions,
//   getStateOptions,
//   getRegionOptions,
//   getLunarDateLabel,
//   getSunTimes,
//   type HolidayItem,
//   type SunTimes,
// } from "./logic";

// const TOOL_SLUG = "calendar";

// const TYPE_LABELS: Record<string, string> = {
//   public: "Public Holiday",
//   bank: "Bank Holiday",
//   school: "School Holiday",
//   observance: "Observance",
//   optional: "Optional Holiday",
//   half_day: "Half Day",
//   government: "Government Holiday",
//   workday: "Workday",
//   unofficial: "Unofficial",
//   armed_forces: "Armed Forces",
//   de_facto: "De Facto",
//   festival: "Festival",
// };

// const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// /* ------------------------------------------------------------------ */
// /*  Mini Month — used in Year view                                     */
// /* ------------------------------------------------------------------ */
// function MiniMonth({
//   monthDate,
//   holidays,
//   selectedDate,
//   onSelectDate,
// }: {
//   monthDate: Date;
//   holidays: HolidayItem[];
//   selectedDate?: Date;
//   onSelectDate: (d: Date) => void;
// }) {
//   const monthStart = startOfMonth(monthDate);
//   const monthEnd = endOfMonth(monthDate);
//   const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
//   const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
//   const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

//   const holidayMap = useMemo(() => {
//     const map = new Map<string, HolidayItem>();
//     holidays.forEach((h) => {
//       const key = format(h.date, "yyyy-MM-dd");
//       if (!map.has(key)) map.set(key, h);
//     });
//     return map;
//   }, [holidays]);

//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-[var(--border-card)] dark:bg-[var(--surface-card)] dark:shadow-none">
//       <p className="mb-2 text-center text-[13px] font-bold text-[var(--text-primary)]">
//         {format(monthDate, "MMMM")}
//       </p>

//       <div className="grid grid-cols-7 gap-1.5 text-center">
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
//           const isSelected = selectedDate && isSameDay(day, selectedDate);
//           const isHoliday = holidayMap.has(key);
//           const today = isToday(day);

//           return (
//             <button
//               key={key}
//               type="button"
//               disabled={!inMonth}
//               onClick={() => inMonth && onSelectDate(day)}
//               className={cn(
//                 "flex aspect-square items-center justify-center rounded-full text-[11px] transition",
//                 !inMonth && "text-muted-foreground/20",
//                 inMonth &&
//                   !isSelected &&
//                   !isHoliday &&
//                   !today &&
//                   "text-[var(--text-primary)] hover:bg-[var(--surface-btn-secondary)]",
//                 inMonth &&
//                   isHoliday &&
//                   !isSelected &&
//                   !today &&
//                   "bg-emerald-100 font-bold text-emerald-800 ring-1 ring-emerald-400/70 shadow-[0_0_10px_rgba(16,185,129,0.55)] hover:bg-emerald-200 dark:bg-emerald-500/25 dark:text-emerald-200 dark:ring-emerald-400/60 dark:shadow-[0_0_12px_rgba(16,185,129,0.65)]",
//                 inMonth &&
//                   today &&
//                   !isSelected &&
//                   "bg-orange-400 font-bold text-white ring-2 ring-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.7)] hover:bg-orange-500 dark:bg-orange-500 dark:text-white dark:ring-orange-400 dark:shadow-[0_0_14px_rgba(249,115,22,0.75)]",
//                 isSelected &&
//                   "bg-[var(--purple)] font-bold text-white ring-2 ring-[var(--purple)]/40 shadow-[0_0_12px_rgba(99,84,232,0.6)] hover:bg-[var(--purple)]"
//               )}
//               title={isHoliday ? holidayMap.get(key)?.name : undefined}
//             >
//               {format(day, "d")}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Sun Times Panel                                                    */
// /* ------------------------------------------------------------------ */
// function SunTimesPanel({ times }: { times: SunTimes | null }) {
//   if (!times) return null;

//   const rows = [
//     { label: "Dawn", value: times.dawn, Icon: Sun, color: "text-indigo-500" },
//     { label: "Sunrise", value: times.sunrise, Icon: Sunrise, color: "text-amber-500" },
//     { label: "Solar Noon", value: times.solarNoon, Icon: Sun, color: "text-yellow-500" },
//     { label: "Sunset", value: times.sunset, Icon: Sunset, color: "text-orange-500" },
//     { label: "Dusk", value: times.dusk, Icon: Moon, color: "text-violet-500" },
//   ];

//   return (
//     <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-3">
//       <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
//         Sun Times
//       </p>
//       <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
//         {rows.map(({ label, value, Icon, color }) => (
//           <div key={label} className="flex items-center gap-2">
//             <Icon size={12} className={color} />
//             <div className="min-w-0">
//               <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
//                 {label}
//               </p>
//               <p className="font-mono text-[12px] font-semibold text-[var(--text-primary)]">
//                 {value ? format(value, "h:mm a") : "—"}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Month Holiday List                                                 */
// /* ------------------------------------------------------------------ */
// function MonthHolidayList({
//   holidays,
//   onHolidayClick,
// }: {
//   holidays: HolidayItem[];
//   onHolidayClick: (h: HolidayItem) => void;
// }) {
//   if (holidays.length === 0) {
//     return (
//       <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-4">
//         <p className="text-[13px] leading-5 text-muted-foreground">
//           No festivals or holidays recorded this month.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
//       <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
//         This Month&apos;s Festivals ({holidays.length})
//       </p>
//       <ul className="max-h-[260px] space-y-1.5 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border-card)]">
//         {holidays.map((h) => (
//           <li key={`${h.dateString}-${h.name}`}>
//             <button
//               type="button"
//               onClick={() => onHolidayClick(h)}
//               className="group flex w-full items-start gap-3 rounded-lg p-2 text-left transition hover:bg-[var(--surface-btn-secondary)]"
//             >
//               <div className="flex w-10 shrink-0 flex-col items-center rounded-md bg-[var(--surface-btn-secondary)] py-1">
//                 <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
//                   {format(h.date, "MMM")}
//                 </span>
//                 <span className="text-[13px] font-bold text-[var(--text-primary)]">
//                   {format(h.date, "d")}
//                 </span>
//               </div>
//               <div className="min-w-0 flex-1">
//                 <p className="truncate text-[12px] font-semibold text-[var(--text-primary)]">
//                   {h.name}
//                 </p>
//                 <p className="mt-0.5 text-[10px] text-muted-foreground">
//                   {TYPE_LABELS[h.type] ?? h.type}
//                 </p>
//               </div>
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Main Component                                                     */
// /* ------------------------------------------------------------------ */
// export function Calendar() {
//   const [view, setView] = useState<"year" | "month">("year");
//   const [country, setCountry] = useState("IN");
//   const [state, setState] = useState("");
//   const [region, setRegion] = useState("");
//   const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

//   const visibleMonth = useMemo(
//     () => new Date(selectedYear, selectedMonth, 1),
//     [selectedYear, selectedMonth]
//   );

//   const countryOptions = useMemo(() => getCountryOptions(), []);
//   const stateOptions = useMemo(() => getStateOptions(country), [country]);
//   const regionOptions = useMemo(
//     () => (state ? getRegionOptions(country, state) : []),
//     [country, state]
//   );

//   const yearOptions = useMemo(() => {
//     const currentYear = new Date().getFullYear();
//     return Array.from({ length: 21 }, (_, i) => {
//       const y = currentYear - 10 + i;
//       return { value: String(y), label: String(y) };
//     });
//   }, []);

//   const monthOptions = useMemo(
//     () =>
//       Array.from({ length: 12 }, (_, i) => ({
//         value: String(i),
//         label: format(new Date(2024, i, 1), "MMMM"),
//       })),
//     []
//   );

//   /* Fetch holidays for the selected year */
//   const holidays: HolidayItem[] = useMemo(() => {
//     return getHolidays(
//       country,
//       selectedYear,
//       state || undefined,
//       region || undefined
//     );
//   }, [country, selectedYear, state, region]);

//   const holidayMap = useMemo(() => {
//     const map = new Map<string, HolidayItem>();
//     holidays.forEach((h) => map.set(h.dateString, h));
//     return map;
//   }, [holidays]);

//   /* Holidays for the currently selected month */
//   const monthHolidays = useMemo(() => {
//     return holidays.filter(
//       (h) =>
//         h.date.getFullYear() === selectedYear &&
//         h.date.getMonth() === selectedMonth
//     );
//   }, [holidays, selectedYear, selectedMonth]);

//   const selectedDateString = selectedDate
//     ? format(selectedDate, "yyyy-MM-dd")
//     : "";
//   const selectedHoliday = holidayMap.get(selectedDateString);

//   /* Lunar label for the selected date */
//   const lunarDateLabel = useMemo(() => {
//     if (!selectedDate) return null;
//     return getLunarDateLabel(selectedDate, country);
//   }, [selectedDate, country]);

//   /* Sun times for the selected date */
//   const sunTimes = useMemo(() => {
//     if (!selectedDate) return null;
//     return getSunTimes(selectedDate, country, state || undefined);
//   }, [selectedDate, country, state]);

//   const monthsInYear = useMemo(() => {
//     const start = startOfYear(new Date(selectedYear, 0, 1));
//     return Array.from({ length: 12 }, (_, i) => addMonths(start, i));
//   }, [selectedYear]);

//   const visibleFilterCount =
//     1 +
//     (stateOptions.length > 0 ? 1 : 0) +
//     (regionOptions.length > 0 ? 1 : 0) +
//     1 +
//     1;

//   return (
//     <div className="space-y-4">
//       <section className="tool-card rounded-3xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 sm:p-7">
//         <ToolCardHeader slug={TOOL_SLUG} />

//         {/* Filters */}
//         <div
//           className={cn(
//             "mt-5 grid gap-3 sm:grid-cols-2",
//             visibleFilterCount >= 4 && "lg:grid-cols-4",
//             visibleFilterCount === 3 && "lg:grid-cols-3",
//             visibleFilterCount <= 2 && "lg:grid-cols-2"
//           )}
//         >
//           <SearchableSelect
//             label="Country / Region"
//             value={country}
//             onChange={(v) => {
//               setCountry(v);
//               setState("");
//               setRegion("");
//             }}
//             options={countryOptions}
//             placeholder="Search country..."
//           />

//           {stateOptions.length > 0 && (
//             <SearchableSelect
//               label="State / Province"
//               value={state}
//               onChange={(v) => {
//                 setState(v);
//                 setRegion("");
//               }}
//               options={stateOptions}
//               placeholder="Search state..."
//             />
//           )}

//           {regionOptions.length > 0 && (
//             <SearchableSelect
//               label="Region"
//               value={region}
//               onChange={setRegion}
//               options={regionOptions}
//               placeholder="Search region..."
//             />
//           )}

//           <SearchableSelect
//             label="Year"
//             value={String(selectedYear)}
//             onChange={(v) => setSelectedYear(Number(v))}
//             options={yearOptions}
//           />

//           <SearchableSelect
//             label="Month"
//             value={String(selectedMonth)}
//             onChange={(v) => {
//               setSelectedMonth(Number(v));
//               setView("month");
//             }}
//             options={monthOptions}
//           />
//         </div>

//         {/* View toggle */}
//         <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-3">
//           <div className="flex items-center gap-3">
//             <p className="text-[13px] font-semibold text-[var(--text-primary)]">
//               {view === "year"
//                 ? `${selectedYear} Overview`
//                 : format(visibleMonth, "MMMM yyyy")}
//             </p>
//             <span className="rounded-full bg-[var(--surface-btn-secondary)] px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
//               {view === "year" ? `${holidays.length} holidays` : `${monthHolidays.length} this month`}
//             </span>
//           </div>

//           <div className="inline-flex items-center gap-1 rounded-xl bg-[var(--surface-btn-secondary)] p-1">
//             <button
//               type="button"
//               onClick={() => setView("year")}
//               className={cn(
//                 "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition",
//                 view === "year"
//                   ? "bg-[var(--purple)] text-white"
//                   : "text-muted-foreground hover:text-[var(--text-primary)]"
//               )}
//             >
//               <LayoutGrid size={13} />
//               Year
//             </button>
//             <button
//               type="button"
//               onClick={() => setView("month")}
//               className={cn(
//                 "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition",
//                 view === "month"
//                   ? "bg-[var(--purple)] text-white"
//                   : "text-muted-foreground hover:text-[var(--text-primary)]"
//               )}
//             >
//               <CalendarDays size={13} />
//               Month
//             </button>
//           </div>
//         </div>

//         {/* Main content */}
//         <div className="flex flex-col gap-6">
//           <div className="w-full">
//             {view === "year" ? (
//               <div
//                 className={cn(
//                   "rounded-2xl border border-slate-200 bg-slate-100 p-3 sm:p-4",
//                   "dark:border-[var(--border-card)] dark:bg-[var(--surface-btn-secondary)]",
//                   "max-h-[640px] overflow-y-auto overflow-x-hidden",
//                   "[&::-webkit-scrollbar]:w-2",
//                   "[&::-webkit-scrollbar-track]:bg-transparent",
//                   "[&::-webkit-scrollbar-thumb]:rounded-full",
//                   "[&::-webkit-scrollbar-thumb]:bg-slate-300",
//                   "dark:[&::-webkit-scrollbar-thumb]:bg-[var(--border-card)]",
//                   "hover:[&::-webkit-scrollbar-thumb]:bg-[var(--purple)]/40"
//                 )}
//               >
//                 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//                   {monthsInYear.map((m) => (
//                     <MiniMonth
//                       key={m.toISOString()}
//                       monthDate={m}
//                       holidays={holidays}
//                       selectedDate={selectedDate}
//                       onSelectDate={(d) => {
//                         setSelectedDate(d);
//                         setSelectedYear(d.getFullYear());
//                         setSelectedMonth(d.getMonth());
//                       }}
//                     />
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               /* MONTH VIEW: DayPicker + festival list side-by-side on desktop */
//               <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
//                 {/* DayPicker */}
//                 <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-[var(--border-card)] dark:bg-[var(--surface-btn-secondary)]">
//                   <DayPicker
//                     mode="single"
//                     selected={selectedDate}
//                     onSelect={setSelectedDate}
//                     onMonthChange={(m) => {
//                       setSelectedYear(m.getFullYear());
//                       setSelectedMonth(m.getMonth());
//                     }}
//                     month={visibleMonth}
//                     modifiers={{ holiday: monthHolidays.map((h) => h.date) }}
//                     modifiersClassNames={{ holiday: "rdp-holiday-glow" }}
//                     className="calendar-theme"
//                   />
//                 </div>

//                 {/* Month festivals list */}
//                 <div className="lg:sticky lg:top-4 lg:self-start">
//                   <MonthHolidayList
//                     holidays={monthHolidays}
//                     onHolidayClick={(h) => setSelectedDate(h.date)}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Result panel */}
//           <div className="w-full">
//             <ResultPanel
//               title={selectedHoliday ? "Holiday Details" : "Selected Date"}
//             >
//               {selectedDate ? (
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
//                       Date
//                     </p>
//                     <p className="mt-1 text-base font-bold text-[var(--text-primary)]">
//                       {format(selectedDate, "PPPP")}
//                     </p>
//                   </div>

//                   {lunarDateLabel && (
//                     <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-3">
//                       <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
//                         Lunar Date
//                       </p>
//                       <p className="mt-1 text-[13px] font-semibold text-[var(--text-primary)]">
//                         {lunarDateLabel}
//                       </p>
//                     </div>
//                   )}

//                   {selectedHoliday ? (
//                     <div className="rounded-xl border border-emerald-400/60 bg-emerald-50 p-4 shadow-[0_0_16px_rgba(16,185,129,0.25)] dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:shadow-[0_0_16px_rgba(16,185,129,0.35)]">
//                       <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
//                         {TYPE_LABELS[selectedHoliday.type] ?? selectedHoliday.type}
//                       </p>
//                       <p className="mt-1.5 text-base font-bold text-[var(--text-primary)]">
//                         {selectedHoliday.name}
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-4">
//                       <p className="text-[13px] leading-5 text-muted-foreground">
//                         No holiday on this date.
//                       </p>
//                     </div>
//                   )}

//                   <SunTimesPanel times={sunTimes} />

//                   <button
//                     type="button"
//                     onClick={() => setSelectedDate(undefined)}
//                     className="text-xs font-bold text-[var(--purple)] hover:opacity-80"
//                   >
//                     Clear selection
//                   </button>
//                 </div>
//               ) : (
//                 <p className="text-[13px] leading-6 text-muted-foreground">
//                   Click any date on the calendar to see its details.
//                 </p>
//               )}
//             </ResultPanel>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }


// src/features/calculators/calendar/calendar.tsx
"use client";

import { useState, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  startOfYear,
} from "date-fns";
import {
  CalendarDays,
  LayoutGrid,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  CalendarCheck,
  Lightbulb,
} from "lucide-react";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { ResultPanel } from "@/components/ui/result-card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import {
  getHolidays,
  getCountryOptions,
  getStateOptions,
  getRegionOptions,
  getLunarDateLabel,
  getSunTimes,
  getLongWeekends,
  getBridgeSuggestions,
  type HolidayItem,
  type SunTimes,
  type LongWeekend,
  type BridgeSuggestion,
} from "./logic";

const TOOL_SLUG = "calendar";

const TYPE_LABELS: Record<string, string> = {
  public: "Public Holiday",
  bank: "Bank Holiday",
  school: "School Holiday",
  observance: "Observance",
  optional: "Optional Holiday",
  half_day: "Half Day",
  government: "Government Holiday",
  workday: "Workday",
  unofficial: "Unofficial",
  armed_forces: "Armed Forces",
  de_facto: "De Facto",
  festival: "Festival",
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/* ------------------------------------------------------------------ */
/*  Mini Month — used in Year view                                     */
/* ------------------------------------------------------------------ */
function MiniMonth({
  monthDate,
  holidays,
  selectedDate,
  onSelectDate,
}: {
  monthDate: Date;
  holidays: HolidayItem[];
  selectedDate?: Date;
  onSelectDate: (d: Date) => void;
}) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const holidayMap = useMemo(() => {
    const map = new Map<string, HolidayItem>();
    holidays.forEach((h) => {
      const key = format(h.date, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, h);
    });
    return map;
  }, [holidays]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-[var(--border-card)] dark:bg-[var(--surface-card)] dark:shadow-none">
      <p className="mb-2 text-center text-[13px] font-bold text-[var(--text-primary)]">
        {format(monthDate, "MMMM")}
      </p>

      <div className="grid grid-cols-7 gap-1.5 text-center">
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
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isHoliday = holidayMap.has(key);
          const today = isToday(day);

          return (
            <button
              key={key}
              type="button"
              disabled={!inMonth}
              onClick={() => inMonth && onSelectDate(day)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-full text-[11px] transition",
                !inMonth && "text-muted-foreground/20",
                inMonth &&
                  !isSelected &&
                  !isHoliday &&
                  !today &&
                  "text-[var(--text-primary)] hover:bg-[var(--surface-btn-secondary)]",
                inMonth &&
                  isHoliday &&
                  !isSelected &&
                  !today &&
                  "bg-emerald-100 font-bold text-emerald-800 ring-1 ring-emerald-400/70 shadow-[0_0_10px_rgba(16,185,129,0.55)] hover:bg-emerald-200 dark:bg-emerald-500/25 dark:text-emerald-200 dark:ring-emerald-400/60 dark:shadow-[0_0_12px_rgba(16,185,129,0.65)]",
                inMonth &&
                  today &&
                  !isSelected &&
                  "bg-orange-400 font-bold text-white ring-2 ring-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.7)] hover:bg-orange-500 dark:bg-orange-500 dark:text-white dark:ring-orange-400 dark:shadow-[0_0_14px_rgba(249,115,22,0.75)]",
                isSelected &&
                  "bg-[var(--purple)] font-bold text-white ring-2 ring-[var(--purple)]/40 shadow-[0_0_12px_rgba(99,84,232,0.6)] hover:bg-[var(--purple)]"
              )}
              title={isHoliday ? holidayMap.get(key)?.name : undefined}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sun Times Panel                                                    */
/* ------------------------------------------------------------------ */
function SunTimesPanel({ times }: { times: SunTimes | null }) {
  if (!times) return null;

  const rows = [
    { label: "Dawn", value: times.dawn, Icon: Sun, color: "text-indigo-500" },
    {
      label: "Sunrise",
      value: times.sunrise,
      Icon: Sunrise,
      color: "text-amber-500",
    },
    {
      label: "Solar Noon",
      value: times.solarNoon,
      Icon: Sun,
      color: "text-yellow-500",
    },
    {
      label: "Sunset",
      value: times.sunset,
      Icon: Sunset,
      color: "text-orange-500",
    },
    { label: "Dusk", value: times.dusk, Icon: Moon, color: "text-violet-500" },
  ];

  return (
    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Sun Times
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {rows.map(({ label, value, Icon, color }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={12} className={color} />
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p className="font-mono text-[12px] font-semibold text-[var(--text-primary)]">
                {value ? format(value, "h:mm a") : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Month Holiday List                                                 */
/* ------------------------------------------------------------------ */
function MonthHolidayList({
  holidays,
  onHolidayClick,
}: {
  holidays: HolidayItem[];
  onHolidayClick: (h: HolidayItem) => void;
}) {
  if (holidays.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-4">
        <p className="text-[13px] leading-5 text-muted-foreground">
          No festivals or holidays recorded this month.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        This Month&apos;s Festivals ({holidays.length})
      </p>
      <ul className="max-h-[260px] space-y-1.5 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border-card)]">
        {holidays.map((h) => (
          <li key={`${h.dateString}-${h.name}`}>
            <button
              type="button"
              onClick={() => onHolidayClick(h)}
              className="group flex w-full items-start gap-3 rounded-lg p-2 text-left transition hover:bg-[var(--surface-btn-secondary)]"
            >
              <div className="flex w-10 shrink-0 flex-col items-center rounded-md bg-[var(--surface-btn-secondary)] py-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  {format(h.date, "MMM")}
                </span>
                <span className="text-[13px] font-bold text-[var(--text-primary)]">
                  {format(h.date, "d")}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[var(--text-primary)]">
                  {h.name}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {TYPE_LABELS[h.type] ?? h.type}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Long Weekend card                                                  */
/* ------------------------------------------------------------------ */
function LongWeekendCard({ lw }: { lw: LongWeekend }) {
  return (
    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4 transition hover:border-emerald-400/50">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-[var(--text-primary)]">
            {format(lw.start, "EEE, MMM d")} → {format(lw.end, "EEE, MMM d")}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {lw.holidayNames.length > 0
              ? lw.holidayNames.join(" · ")
              : "Weekend only"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          {lw.daysOff} days
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bridge suggestion card                                             */
/* ------------------------------------------------------------------ */
function BridgeCard({ s }: { s: BridgeSuggestion }) {
  return (
    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4 transition hover:border-purple-400/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--purple)]">
            Take {format(s.leaveDate, "EEEE, MMM d")} off
          </p>
          <p className="mt-1 text-[13px] font-semibold text-[var(--text-primary)]">
            {format(s.breakStart, "MMM d")} → {format(s.breakEnd, "MMM d")}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Around {s.holiday.name}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
          {s.totalDaysOff} days off
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
type ViewMode = "year" | "month" | "long-weekend" | "bridge";

export function Calendar() {
  const [view, setView] = useState<ViewMode>("year");
  const [country, setCountry] = useState("IN");
  const [state, setState] = useState("");
  const [region, setRegion] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const visibleMonth = useMemo(
    () => new Date(selectedYear, selectedMonth, 1),
    [selectedYear, selectedMonth]
  );

  const countryOptions = useMemo(() => getCountryOptions(), []);
  const stateOptions = useMemo(() => getStateOptions(country), [country]);
  const regionOptions = useMemo(
    () => (state ? getRegionOptions(country, state) : []),
    [country, state]
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => {
      const y = currentYear - 10 + i;
      return { value: String(y), label: String(y) };
    });
  }, []);

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i),
        label: format(new Date(2024, i, 1), "MMMM"),
      })),
    []
  );

  /* Fetch holidays for the selected year */
  const holidays: HolidayItem[] = useMemo(() => {
    return getHolidays(
      country,
      selectedYear,
      state || undefined,
      region || undefined
    );
  }, [country, selectedYear, state, region]);

  const holidayMap = useMemo(() => {
    const map = new Map<string, HolidayItem>();
    holidays.forEach((h) => map.set(h.dateString, h));
    return map;
  }, [holidays]);

  /* Holidays for the currently selected month */
  const monthHolidays = useMemo(() => {
    return holidays.filter(
      (h) =>
        h.date.getFullYear() === selectedYear &&
        h.date.getMonth() === selectedMonth
    );
  }, [holidays, selectedYear, selectedMonth]);

  /* Long weekends + bridge days — computed only when needed */
  const longWeekends = useMemo(
    () => getLongWeekends(holidays, selectedYear),
    [holidays, selectedYear]
  );
  const bridges = useMemo(() => getBridgeSuggestions(holidays), [holidays]);

  const selectedDateString = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : "";
  const selectedHoliday = holidayMap.get(selectedDateString);

  /* Lunar label for the selected date */
  const lunarDateLabel = useMemo(() => {
    if (!selectedDate) return null;
    return getLunarDateLabel(selectedDate, country);
  }, [selectedDate, country]);

  /* Sun times for the selected date */
  const sunTimes = useMemo(() => {
    if (!selectedDate) return null;
    return getSunTimes(selectedDate, country, state || undefined);
  }, [selectedDate, country, state]);

  const monthsInYear = useMemo(() => {
    const start = startOfYear(new Date(selectedYear, 0, 1));
    return Array.from({ length: 12 }, (_, i) => addMonths(start, i));
  }, [selectedYear]);

  /* Which filters to show depends on the view */
  const showMonthFilter = view === "year" || view === "month";

  const visibleFilterCount =
    1 +
    (stateOptions.length > 0 ? 1 : 0) +
    (regionOptions.length > 0 ? 1 : 0) +
    1 +
    (showMonthFilter ? 1 : 0);

  const modeLabel =
    view === "year"
      ? `${selectedYear} Overview`
      : view === "month"
        ? format(visibleMonth, "MMMM yyyy")
        : view === "long-weekend"
          ? `${selectedYear} Long Weekends`
          : `${selectedYear} Bridge Days`;

  const modeCount =
    view === "year" || view === "month"
      ? view === "year"
        ? `${holidays.length} holidays`
        : `${monthHolidays.length} this month`
      : view === "long-weekend"
        ? `${longWeekends.length} weekends`
        : `${bridges.length} suggestions`;

  return (
    <div className="space-y-4">
      <section className="tool-card rounded-3xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 sm:p-7">
        <ToolCardHeader slug={TOOL_SLUG} />

        {/* Filters */}
        <div
          className={cn(
            "mt-5 grid gap-3 sm:grid-cols-2",
            visibleFilterCount >= 4 && "lg:grid-cols-4",
            visibleFilterCount === 3 && "lg:grid-cols-3",
            visibleFilterCount <= 2 && "lg:grid-cols-2"
          )}
        >
          <SearchableSelect
            label="Country / Region"
            value={country}
            onChange={(v) => {
              setCountry(v);
              setState("");
              setRegion("");
            }}
            options={countryOptions}
            placeholder="Search country..."
          />

          {stateOptions.length > 0 && (
            <SearchableSelect
              label="State / Province"
              value={state}
              onChange={(v) => {
                setState(v);
                setRegion("");
              }}
              options={stateOptions}
              placeholder="Search state..."
            />
          )}

          {regionOptions.length > 0 && (
            <SearchableSelect
              label="Region"
              value={region}
              onChange={setRegion}
              options={regionOptions}
              placeholder="Search region..."
            />
          )}

          <SearchableSelect
            label="Year"
            value={String(selectedYear)}
            onChange={(v) => setSelectedYear(Number(v))}
            options={yearOptions}
          />

          {showMonthFilter && (
            <SearchableSelect
              label="Month"
              value={String(selectedMonth)}
              onChange={(v) => {
                setSelectedMonth(Number(v));
                setView("month");
              }}
              options={monthOptions}
            />
          )}
        </div>

        {/* View toggle */}
        <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">
              {modeLabel}
            </p>
            <span className="rounded-full bg-[var(--surface-btn-secondary)] px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {modeCount}
            </span>
          </div>

          <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-[var(--surface-btn-secondary)] p-1">
            <button
              type="button"
              onClick={() => setView("year")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition",
                view === "year"
                  ? "bg-[var(--purple)] text-white"
                  : "text-muted-foreground hover:text-[var(--text-primary)]"
              )}
            >
              <LayoutGrid size={13} />
              Year
            </button>
            <button
              type="button"
              onClick={() => setView("month")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition",
                view === "month"
                  ? "bg-[var(--purple)] text-white"
                  : "text-muted-foreground hover:text-[var(--text-primary)]"
              )}
            >
              <CalendarDays size={13} />
              Month
            </button>
            <button
              type="button"
              onClick={() => setView("long-weekend")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition",
                view === "long-weekend"
                  ? "bg-[var(--purple)] text-white"
                  : "text-muted-foreground hover:text-[var(--text-primary)]"
              )}
            >
              <CalendarCheck size={13} />
              Long weekends
            </button>
            <button
              type="button"
              onClick={() => setView("bridge")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition",
                view === "bridge"
                  ? "bg-[var(--purple)] text-white"
                  : "text-muted-foreground hover:text-[var(--text-primary)]"
              )}
            >
              <Lightbulb size={13} />
              Bridge days
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-6">
          <div className="w-full">
            {/* YEAR VIEW */}
            {view === "year" && (
              <div
                className={cn(
                  "rounded-2xl border border-slate-200 bg-slate-100 p-3 sm:p-4",
                  "dark:border-[var(--border-card)] dark:bg-[var(--surface-btn-secondary)]",
                  "max-h-[640px] overflow-y-auto overflow-x-hidden",
                  "[&::-webkit-scrollbar]:w-2",
                  "[&::-webkit-scrollbar-track]:bg-transparent",
                  "[&::-webkit-scrollbar-thumb]:rounded-full",
                  "[&::-webkit-scrollbar-thumb]:bg-slate-300",
                  "dark:[&::-webkit-scrollbar-thumb]:bg-[var(--border-card)]",
                  "hover:[&::-webkit-scrollbar-thumb]:bg-[var(--purple)]/40"
                )}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {monthsInYear.map((m) => (
                    <MiniMonth
                      key={m.toISOString()}
                      monthDate={m}
                      holidays={holidays}
                      selectedDate={selectedDate}
                      onSelectDate={(d) => {
                        setSelectedDate(d);
                        setSelectedYear(d.getFullYear());
                        setSelectedMonth(d.getMonth());
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* MONTH VIEW */}
            {view === "month" && (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-[var(--border-card)] dark:bg-[var(--surface-btn-secondary)]">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    onMonthChange={(m) => {
                      setSelectedYear(m.getFullYear());
                      setSelectedMonth(m.getMonth());
                    }}
                    month={visibleMonth}
                    modifiers={{ holiday: monthHolidays.map((h) => h.date) }}
                    modifiersClassNames={{ holiday: "rdp-holiday-glow" }}
                    className="calendar-theme"
                  />
                </div>

                <div className="lg:sticky lg:top-4 lg:self-start">
                  <MonthHolidayList
                    holidays={monthHolidays}
                    onHolidayClick={(h) => setSelectedDate(h.date)}
                  />
                </div>
              </div>
            )}

            {/* LONG WEEKEND VIEW */}
            {view === "long-weekend" && (
              <div>
                {longWeekends.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--border-card)] p-8 text-center">
                    <CalendarCheck
                      size={24}
                      className="mx-auto mb-2 text-muted-foreground"
                    />
                    <p className="text-[13px] text-muted-foreground">
                      No long weekends in {selectedYear} for{" "}
                      {state ? `${state}, ` : ""}
                      {country}.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {longWeekends.map((lw) => (
                      <LongWeekendCard key={lw.id} lw={lw} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BRIDGE DAY VIEW */}
            {view === "bridge" && (
              <div>
                {bridges.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--border-card)] p-8 text-center">
                    <Lightbulb
                      size={24}
                      className="mx-auto mb-2 text-muted-foreground"
                    />
                    <p className="text-[13px] text-muted-foreground">
                      No bridge-day opportunities in {selectedYear} for{" "}
                      {state ? `${state}, ` : ""}
                      {country}.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Lightbulb size={12} className="text-[var(--purple)]" />
                      <span>
                        Take the suggested day off to turn a single-day holiday
                        into a longer break.
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {bridges.map((s) => (
                        <BridgeCard key={s.id} s={s} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Result panel — only shown in year + month views */}
          {(view === "year" || view === "month") && (
            <div className="w-full">
              <ResultPanel
                title={selectedHoliday ? "Holiday Details" : "Selected Date"}
              >
                {selectedDate ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Date
                      </p>
                      <p className="mt-1 text-base font-bold text-[var(--text-primary)]">
                        {format(selectedDate, "PPPP")}
                      </p>
                    </div>

                    {lunarDateLabel && (
                      <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Lunar Date
                        </p>
                        <p className="mt-1 text-[13px] font-semibold text-[var(--text-primary)]">
                          {lunarDateLabel}
                        </p>
                      </div>
                    )}

                    {selectedHoliday ? (
                      <div className="rounded-xl border border-emerald-400/60 bg-emerald-50 p-4 shadow-[0_0_16px_rgba(16,185,129,0.25)] dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:shadow-[0_0_16px_rgba(16,185,129,0.35)]">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                          {TYPE_LABELS[selectedHoliday.type] ??
                            selectedHoliday.type}
                        </p>
                        <p className="mt-1.5 text-base font-bold text-[var(--text-primary)]">
                          {selectedHoliday.name}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-4">
                        <p className="text-[13px] leading-5 text-muted-foreground">
                          No holiday on this date.
                        </p>
                      </div>
                    )}

                    <SunTimesPanel times={sunTimes} />

                    <button
                      type="button"
                      onClick={() => setSelectedDate(undefined)}
                      className="text-xs font-bold text-[var(--purple)] hover:opacity-80"
                    >
                      Clear selection
                    </button>
                  </div>
                ) : (
                  <p className="text-[13px] leading-6 text-muted-foreground">
                    Click any date on the calendar to see its details.
                  </p>
                )}
              </ResultPanel>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}