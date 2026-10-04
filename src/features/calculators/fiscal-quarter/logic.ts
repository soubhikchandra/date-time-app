// src/features/calculators/fiscal-quarter/logic.ts
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  getDaysInMonth,
  startOfDay,
} from "date-fns";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FiscalConfig {
  startMonth: number; // 1-12
  startDay: number;   // 1-31 (clamped to valid range for the month)
}

export interface FiscalPreset {
  label: string;
  month: number;
  day: number;
}

export const FISCAL_PRESETS: FiscalPreset[] = [
  { label: "Calendar year",      month: 1,  day: 1 },
  { label: "India / UK / Canada", month: 4,  day: 1 },
  { label: "Australia",          month: 7,  day: 1 },
  { label: "US Government",      month: 10, day: 1 },
  { label: "Japan",              month: 4,  day: 1 },
];

export interface QuarterInfo {
  index: number;         // 1..4
  fiscalYear: number;    // end-year convention
  start: Date;           // inclusive
  end: Date;             // inclusive (last day)
  daysTotal: number;
  daysElapsed: number;   // relative to reference date
  daysRemaining: number;
  progressPct: number;   // 0..100
  status: "past" | "current" | "future";
}

export interface FiscalResult {
  quarter: QuarterInfo;
  allQuarters: QuarterInfo[];
  fiscalYearStart: Date;
  fiscalYearEnd: Date;
  referenceDate: Date;
  config: FiscalConfig;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* ------------------------------------------------------------------ */
/*  Core computation                                                   */
/* ------------------------------------------------------------------ */

/** Build a safe fiscal start date for a given calendar year. */
function fiscalStartInYear(year: number, config: FiscalConfig): Date {
  const monthIdx = Math.max(0, Math.min(11, config.startMonth - 1));
  const maxDay = getDaysInMonth(new Date(year, monthIdx, 1));
  const day = Math.max(1, Math.min(maxDay, config.startDay));
  return startOfDay(new Date(year, monthIdx, day));
}

/** Find the fiscal year start that contains the reference date. */
function findFiscalYearStart(reference: Date, config: FiscalConfig): Date {
  const refDay = startOfDay(reference);
  const thisYear = fiscalStartInYear(refDay.getFullYear(), config);
  if (refDay < thisYear) {
    return fiscalStartInYear(refDay.getFullYear() - 1, config);
  }
  return thisYear;
}

export function computeFiscal(
  reference: Date,
  config: FiscalConfig
): FiscalResult {
  const refDay = startOfDay(reference);
  const start = findFiscalYearStart(refDay, config);
  const end = addDays(addMonths(start, 12), -1); // inclusive
  const fiscalYear = end.getFullYear();          // end-year convention

  const allQuarters: QuarterInfo[] = [];

  for (let i = 0; i < 4; i++) {
    const qStart = addMonths(start, i * 3);
    const qNext = addMonths(start, (i + 1) * 3);
    const qEnd = addDays(qNext, -1);
    const daysTotal = differenceInCalendarDays(qEnd, qStart) + 1;

    let daysElapsed = 0;
    let daysRemaining = 0;
    let progressPct = 0;
    let status: QuarterInfo["status"] = "future";

    if (refDay < qStart) {
      daysRemaining = daysTotal;
      status = "future";
    } else if (refDay > qEnd) {
      daysElapsed = daysTotal;
      progressPct = 100;
      status = "past";
    } else {
      daysElapsed = differenceInCalendarDays(refDay, qStart) + 1;
      daysRemaining = daysTotal - daysElapsed;
      progressPct = Math.round((daysElapsed / daysTotal) * 100);
      status = "current";
    }

    allQuarters.push({
      index: i + 1,
      fiscalYear,
      start: qStart,
      end: qEnd,
      daysTotal,
      daysElapsed,
      daysRemaining,
      progressPct,
      status,
    });
  }

  const currentQuarter =
    allQuarters.find((q) => q.status === "current") ?? allQuarters[0];

  return {
    quarter: currentQuarter,
    allQuarters,
    fiscalYearStart: start,
    fiscalYearEnd: end,
    referenceDate: refDay,
    config,
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Days until the next quarter starts (0 if we're in Q4). */
export function daysUntilNextQuarter(result: FiscalResult): number {
  const cur = result.quarter;
  if (cur.index >= 4) return 0;
  const next = result.allQuarters[cur.index];
  return differenceInCalendarDays(next.start, result.referenceDate);
}

/** Days until the fiscal year ends (inclusive). */
export function daysUntilFiscalYearEnd(result: FiscalResult): number {
  return differenceInCalendarDays(
    result.fiscalYearEnd,
    result.referenceDate
  );
}