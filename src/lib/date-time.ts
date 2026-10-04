// import {
//   differenceInYears,
//   differenceInMonths,
//   differenceInDays,
// } from "date-fns";

// export interface AgeResult {
//   years: number;
//   months: number;
//   days: number;
//   totalDays: number;
// }

// export function calculateAge(dob: Date, now: Date = new Date()): AgeResult {
//   return {
//     years: differenceInYears(now, dob),
//     months: differenceInMonths(now, dob) % 12,
//     days: differenceInDays(now, dob) % 30,
//     totalDays: differenceInDays(now, dob),
//   };
// }

// export function localDate(value: string): Date {
//   if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(Number.NaN);
//   return new Date(`${value}T12:00:00`);
// }

// export function dateLabel(
//   value: Date,
//   options: Intl.DateTimeFormatOptions = {
//     month: "long",
//     day: "numeric",
//     year: "numeric",
//   }
// ): string {
//    return new Intl.DateTimeFormat("en-US", options).format(value);
// }

// export function isoToday(): string {
//   return new Date().toISOString().slice(0, 10);
// }


import { addMonths, differenceInDays, differenceInMonths } from "date-fns";

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

/**
 * Exact calendar age.
 *
 *   1. totalMonths = whole calendar months between the two dates
 *   2. anchor      = dob + totalMonths (date-fns clamps e.g. Jan 31 -> Feb 28)
 *   3. days        = days from the anchor to `now`
 */
export function calculateAge(dob: Date, now: Date = new Date()): AgeResult {
  const totalMonths = differenceInMonths(now, dob);
  const anchor = addMonths(dob, totalMonths);

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days: differenceInDays(now, anchor),
    totalDays: differenceInDays(now, dob),
  };
}

export function localDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(Number.NaN);
  return new Date(`${value}T12:00:00`);
}

export function dateLabel(
  value: Date,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  }
): string {
  return new Intl.DateTimeFormat("en-US", options).format(value);
}

/** Today as YYYY-MM-DD in the user's LOCAL timezone (not UTC). */
export function isoToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}