import { eachDayOfInterval, isWeekend, differenceInDays } from "date-fns";

export interface BusinessDaysResult {
  /** Working days in the range, inclusive of both endpoints if they're weekdays. */
  total: number;
  /** Calendar days in the range. */
  calendarDays: number;
  /** Weekend days skipped. */
  weekends: number;
  /** Holiday dates that fell inside the range and were a weekday. */
  holidaysApplied: number;
  /** True when start > end. */
  reversed: boolean;
  start: Date;
  end: Date;
}

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function getBusinessDays(
  startStr: string,
  endStr: string,
  holidays: string[] = []
): BusinessDaysResult | null {
  const a = parseDate(startStr);
  const b = parseDate(endStr);
  if (!a || !b) return null;

  const reversed = a > b;
  const start = reversed ? b : a;
  const end = reversed ? a : b;

  const days = eachDayOfInterval({ start, end });
  const holidaySet = new Set(holidays);

  let weekends = 0;
  let holidaysApplied = 0;
  let total = 0;

  for (const day of days) {
    if (isWeekend(day)) {
      weekends += 1;
      continue;
    }
    if (holidaySet.has(toKey(day))) {
      holidaysApplied += 1;
      continue;
    }
    total += 1;
  }

  return {
    total,
    calendarDays: differenceInDays(end, start) + 1,
    weekends,
    holidaysApplied,
    reversed,
    start,
    end,
  };
}