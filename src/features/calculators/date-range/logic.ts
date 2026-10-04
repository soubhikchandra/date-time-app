// src/features/calculators/date-range/logic.ts
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isWeekend,
} from "date-fns";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type RangeFilter =
  | "all"
  | "weekdays"
  | "weekends"
  | "every-2"
  | "every-3"
  | "every-7";

export interface RangeFilterMeta {
  value: RangeFilter;
  label: string;
}

export const RANGE_FILTERS: RangeFilterMeta[] = [
  { value: "all",      label: "All days" },
  { value: "weekdays", label: "Weekdays only" },
  { value: "weekends", label: "Weekends only" },
  { value: "every-2",  label: "Every 2 days" },
  { value: "every-3",  label: "Every 3 days" },
  { value: "every-7",  label: "Every 7 days" },
];

export interface DayEntry {
  date: Date;
  iso: string;
  weekday: string;
  isWeekend: boolean;
  index: number;
}

export interface DateRangeResult {
  from: Date;
  to: Date;
  reversed: boolean;
  calendarDays: number;
  filteredCount: number;
  weekdaysCount: number;
  weekendsCount: number;
  days: DayEntry[];
  filter: RangeFilter;
  weekdayCounts: number[];
}

/* ------------------------------------------------------------------ */
/*  Parsing                                                            */
/* ------------------------------------------------------------------ */

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/* ------------------------------------------------------------------ */
/*  Filtering                                                          */
/* ------------------------------------------------------------------ */

/**
 * Returns true when the date passes the filter (before the step filter
 * is applied). Step-based filters (every-2, every-3, every-7) don't
 * exclude anything here — they're handled by index stepping.
 */
function passesFilter(d: Date, filter: RangeFilter): boolean {
  if (filter === "weekdays") return !isWeekend(d);
  if (filter === "weekends") return isWeekend(d);
  return true;
}

function filterStep(filter: RangeFilter): number {
  switch (filter) {
    case "every-2":
      return 2;
    case "every-3":
      return 3;
    case "every-7":
      return 7;
    default:
      return 1;
  }
}

/* ------------------------------------------------------------------ */
/*  Main computation                                                   */
/* ------------------------------------------------------------------ */

export function getDateRange(
  fromStr: string,
  toStr: string,
  filter: RangeFilter
): DateRangeResult | null {
  const a = parseDate(fromStr);
  const b = parseDate(toStr);
  if (!a || !b) return null;

  const reversed = a > b;
  const from = reversed ? b : a;
  const to = reversed ? a : b;

  const calendarDays = differenceInCalendarDays(to, from) + 1;

  const allDays = eachDayOfInterval({ start: from, end: to });

  // First apply the semantic predicate (weekdays/weekends), then step.
  const predicateMatched = allDays.filter((d) => passesFilter(d, filter));
  const step = filterStep(filter);
  const filtered =
    step > 1
      ? predicateMatched.filter((_, i) => i % step === 0)
      : predicateMatched;

  const days: DayEntry[] = filtered.map((d, i) => ({
    date: d,
    iso: format(d, "yyyy-MM-dd"),
    weekday: format(d, "EEE"),
    isWeekend: isWeekend(d),
    index: i + 1,
  }));

  // Stats over the FULL range (not the filtered set)
  let weekdaysCount = 0;
  let weekendsCount = 0;
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]; // Mon..Sun

  for (const d of allDays) {
    if (isWeekend(d)) weekendsCount++;
    else weekdaysCount++;

    // getDay(): 0=Sun, 1=Mon, … 6=Sat → reindex to Mon=0..Sun=6
    const dow = (d.getDay() + 6) % 7;
    weekdayCounts[dow]++;
  }

  return {
    from,
    to,
    reversed,
    calendarDays,
    filteredCount: days.length,
    weekdaysCount,
    weekendsCount,
    days,
    filter,
    weekdayCounts,
  };
}

/* ------------------------------------------------------------------ */
/*  Export helpers                                                     */
/* ------------------------------------------------------------------ */

export function toPlainList(result: DateRangeResult): string {
  return result.days.map((d) => d.iso).join("\n");
}

export function toCsv(result: DateRangeResult): string {
  const rows = ["date,weekday,is_weekend"];
  for (const d of result.days) {
    rows.push(`${d.iso},${d.weekday},${d.isWeekend ? "yes" : "no"}`);
  }
  return rows.join("\n");
}

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];