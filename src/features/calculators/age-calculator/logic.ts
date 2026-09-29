import { calculateAge, type AgeResult } from "@/lib/date-time";

export interface AgeBreakdown {
  months: { total: number; remainderWeeks: number; remainderDays: number };
  weeks: { total: number; remainderDays: number };
  days: number;
}

export function getAgeFromInput(
  dobString: string,
  asOfString: string = new Date().toISOString().slice(0, 10)
): AgeResult | null {
  if (!dobString || !asOfString) return null;
  const dob = new Date(dobString);
  const asOf = new Date(asOfString);
  if (Number.isNaN(dob.getTime()) || Number.isNaN(asOf.getTime())) return null;
  if (dob > asOf) return null;
  return calculateAge(dob, asOf);
}

export function getAgeBreakdown(
  dobString: string,
  asOfString: string
): AgeBreakdown | null {
  if (!dobString || !asOfString) return null;
  const dob = new Date(dobString);
  const asOf = new Date(asOfString);
  if (Number.isNaN(dob.getTime()) || Number.isNaN(asOf.getTime())) return null;
  if (dob > asOf) return null;

  const totalDays = Math.floor(
    (asOf.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalWeeks = Math.floor(totalDays / 7);
  const weeksRemainderDays = totalDays % 7;

  const totalMonths =
    (asOf.getFullYear() - dob.getFullYear()) * 12 +
    (asOf.getMonth() - dob.getMonth()) -
    (asOf.getDate() < dob.getDate() ? 1 : 0);

  // Days left over after subtracting whole months
  const afterMonths = new Date(dob);
  afterMonths.setMonth(afterMonths.getMonth() + totalMonths);
  const monthsRemainderDays = Math.floor(
    (asOf.getTime() - afterMonths.getTime()) / (1000 * 60 * 60 * 24)
  );
  const monthsRemainderWeeks = Math.floor(monthsRemainderDays / 7);
  const monthsRemainderDaysLeft = monthsRemainderDays % 7;

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