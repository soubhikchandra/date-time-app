// import { calculateAge, type AgeResult } from "@/lib/date-time";

// export interface AgeBreakdown {
//   months: { total: number; remainderWeeks: number; remainderDays: number };
//   weeks: { total: number; remainderDays: number };
//   days: number;
// }

// export function getAgeFromInput(
//   dobString: string,
//   asOfString: string = new Date().toISOString().slice(0, 10)
// ): AgeResult | null {
//   if (!dobString || !asOfString) return null;
//   const dob = new Date(dobString);
//   const asOf = new Date(asOfString);
//   if (Number.isNaN(dob.getTime()) || Number.isNaN(asOf.getTime())) return null;
//   if (dob > asOf) return null;
//   return calculateAge(dob, asOf);
// }

// export function getAgeBreakdown(
//   dobString: string,
//   asOfString: string
// ): AgeBreakdown | null {
//   if (!dobString || !asOfString) return null;
//   const dob = new Date(dobString);
//   const asOf = new Date(asOfString);
//   if (Number.isNaN(dob.getTime()) || Number.isNaN(asOf.getTime())) return null;
//   if (dob > asOf) return null;

//   const totalDays = Math.floor(
//     (asOf.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24)
//   );
//   const totalWeeks = Math.floor(totalDays / 7);
//   const weeksRemainderDays = totalDays % 7;

//   const totalMonths =
//     (asOf.getFullYear() - dob.getFullYear()) * 12 +
//     (asOf.getMonth() - dob.getMonth()) -
//     (asOf.getDate() < dob.getDate() ? 1 : 0);

//   // Days left over after subtracting whole months
//   const afterMonths = new Date(dob);
//   afterMonths.setMonth(afterMonths.getMonth() + totalMonths);
//   const monthsRemainderDays = Math.floor(
//     (asOf.getTime() - afterMonths.getTime()) / (1000 * 60 * 60 * 24)
//   );
//   const monthsRemainderWeeks = Math.floor(monthsRemainderDays / 7);
//   const monthsRemainderDaysLeft = monthsRemainderDays % 7;

//   return {
//     months: {
//       total: totalMonths,
//       remainderWeeks: monthsRemainderWeeks,
//       remainderDays: monthsRemainderDaysLeft,
//     },
//     weeks: { total: totalWeeks, remainderDays: weeksRemainderDays },
//     days: totalDays,
//   };
// }


import {
  differenceInDays,
  differenceInMonths,
} from "date-fns";
import { calculateAge, type AgeResult } from "@/lib/date-time";

export interface AgeBreakdown {
  months: { total: number; remainderWeeks: number; remainderDays: number };
  weeks: { total: number; remainderDays: number };
  days: number;
}

/* ------------------------------------------------------------------ */
/*  Safe local-date parser                                             */
/* ------------------------------------------------------------------ */
function parseLocal(value: string): Date | null {
  if (!value) return null;
  // If the input comes in as DD-MM-YYYY, normalize it to YYYY-MM-DD first
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [d, m, y] = value.split("-");
    value = `\({y}-\){m}-${d}`;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsedDate = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */
export function getAgeFromInput(
  dobString: string,
  asOfString: string = new Date().toISOString().slice(0, 10)
): AgeResult | null {
  const dob = parseLocal(dobString);
  const asOf = parseLocal(asOfString);
  if (!dob || !asOf) return null;
  if (dob > asOf) return null;
  return calculateAge(dob, asOf);
}

export function getAgeBreakdown(
  dobString: string,
  asOfString: string
): AgeBreakdown | null {
  const dob = parseLocal(dobString);
  const asOf = parseLocal(asOfString);
  if (!dob || !asOf) return null;
  if (dob > asOf) return null;

  // Get exact main age details to sync remainder days cleanly
  const exactAge = calculateAge(dob, asOf);
  const totalDays = differenceInDays(asOf, dob);
  const totalWeeks = Math.floor(totalDays / 7);
  const weeksRemainderDays = totalDays % 7;
  const totalMonths = differenceInMonths(asOf, dob);

  // Use the exact days calculated by calculateAge to maintain consistency
  const monthsRemainderDaysLeft = exactAge ? exactAge.days : 0;
  const monthsRemainderWeeks = Math.floor(monthsRemainderDaysLeft / 7);

  return {
    months: {
      total: totalMonths,
      remainderWeeks: monthsRemainderWeeks,
      remainderDays: monthsRemainderDaysLeft,
    },
    weeks: { total: totalWeeks, remainderDays: weeksRemainderDays },
    days: totalDays,
  };
}