import {
  differenceInYears,
  differenceInMonths,
  differenceInDays,
} from "date-fns"; //what if i dont use this pkg , and write my own?

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
  };//define me example of this :
}