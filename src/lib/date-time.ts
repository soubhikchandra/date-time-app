import {
  differenceInYears,
  differenceInMonths,
  differenceInDays,
} from "date-fns";

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export function calculateAge(dob: Date, now: Date = new Date()): AgeResult {
  return {
    years: differenceInYears(now, dob),
    months: differenceInMonths(now, dob) % 12,
    days: differenceInDays(now, dob) % 30,
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

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}