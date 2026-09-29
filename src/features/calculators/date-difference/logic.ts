import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from "date-fns";

export interface DateDiffResult {
  /** Absolute day count between the two dates. */
  totalDays: number;
  /** True when end < start. */
  reversed: boolean;
  /** Full weeks + leftover days. */
  weeks: { total: number; remainderDays: number };
  /** Full months + leftover days. */
  months: { total: number; remainderDays: number };
  /** Years + months + days (calendar style). */
  calendar: { years: number; months: number; days: number };
}

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getDateDifference(
  startStr: string,
  endStr: string
): DateDiffResult | null {
  const a = parseDate(startStr);
  const b = parseDate(endStr);
  if (!a || !b) return null;

  // Normalize order so calendar math is always forward.
  const reversed = a > b;
  const start = reversed ? b : a;
  const end = reversed ? a : b;

  const totalDays = differenceInDays(end, start);
  const totalWeeks = Math.floor(totalDays / 7);
  const weeksRemainder = totalDays % 7;

  const totalMonths = differenceInMonths(end, start);
  const afterMonths = new Date(start);
  afterMonths.setMonth(afterMonths.getMonth() + totalMonths);
  const monthsRemainderDays = differenceInDays(end, afterMonths);

  const years = differenceInYears(end, start);
  const afterYears = new Date(start);
  afterYears.setFullYear(afterYears.getFullYear() + years);

  const yearsMonths = differenceInMonths(end, afterYears);
  const afterYearsMonths = new Date(afterYears);
  afterYearsMonths.setMonth(afterYearsMonths.getMonth() + yearsMonths);
  const yearsDays = differenceInDays(end, afterYearsMonths);

  return {
    totalDays,
    reversed,
    weeks: { total: totalWeeks, remainderDays: weeksRemainder },
    months: { total: totalMonths, remainderDays: monthsRemainderDays },
    calendar: {
      years,
      months: yearsMonths,
      days: yearsDays,
    },
  };
}