import {
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
  endOfISOWeek,
  addWeeks,
  getISOWeeksInYear,
  getISODay,
} from "date-fns";

export interface WeekNumberResult {
  week: number;
  year: number;
  start: Date;
  end: Date;
  crossYear: boolean;
}

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ----------------------------------------------------------------- */
/*  Date → Week                                                       */
/* ----------------------------------------------------------------- */

export function getWeekNumber(dateStr: string): WeekNumberResult | null {
  const date = parseDate(dateStr);
  if (!date) return null;

  const week = getISOWeek(date);
  const year = getISOWeekYear(date);

  return {
    week,
    year,
    start: startOfISOWeek(date),
    end: endOfISOWeek(date),
    crossYear: year !== date.getFullYear(),
  };
}

/* ----------------------------------------------------------------- */
/*  Prev / Next week                                                  */
/* ----------------------------------------------------------------- */

/** Shift the date by N weeks, preserving the same weekday. */
export function shiftWeek(dateStr: string, deltaWeeks: number): string {
  const date = parseDate(dateStr);
  if (!date) return dateStr;
  return toIso(addWeeks(date, deltaWeeks));
}

/* ----------------------------------------------------------------- */
/*  Week → Date (reverse lookup)                                      */
/* ----------------------------------------------------------------- */

export interface WeekDates {
  week: number;
  year: number;
  start: Date;
  end: Date;
  invalid: boolean;
  totalWeeks: number;
}

export function getDatesFromWeek(
  week: number,
  year: number
): WeekDates | null {
  if (!Number.isFinite(week) || !Number.isFinite(year)) return null;
  if (week < 1 || week > 53) return null;
  if (year < 1900 || year > 2200) return null;

  // Week 1 = the ISO week that contains Jan 4 (guaranteed to be in week 1).
  const anchor = new Date(year, 0, 4);
  const totalWeeks = getISOWeeksInYear(anchor);
  const invalid = week > totalWeeks;

  const weekStart = startOfISOWeek(anchor);
  const start = addWeeks(weekStart, week - 1);
  const end = endOfISOWeek(start);

  return { week, year, start, end, invalid, totalWeeks };
}

/* ----------------------------------------------------------------- */
/*  Stats                                                             */
/* ----------------------------------------------------------------- */

export interface WeekStats {
  /** Full weeks after the current one, until end of the ISO year. */
  weeksLeft: number;
  /** Days remaining in the current week, including today. */
  daysLeftInWeek: number;
  /** Total ISO weeks in the current ISO year (52 or 53). */
  totalWeeks: number;
  /** Current day of week (1 = Monday, 7 = Sunday). */
  isoDay: number;
}

export function getWeekStats(dateStr: string): WeekStats | null {
  const date = parseDate(dateStr);
  if (!date) return null;

  const currentWeek = getISOWeek(date);
  const totalWeeks = getISOWeeksInYear(date);
  const isoDay = getISODay(date);

  return {
    weeksLeft: totalWeeks - currentWeek,
    daysLeftInWeek: 8 - isoDay, // Mon → 7, Sun → 1 (includes today)
    totalWeeks,
    isoDay,
  };
}