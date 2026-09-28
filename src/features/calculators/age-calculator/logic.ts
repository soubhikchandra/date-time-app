import { calculateAge, type AgeResult } from "@/lib/date-time";

export function getAgeFromInput(dobString: string): AgeResult | null {
  if (!dobString) return null;
  const date = new Date(dobString);
  if (Number.isNaN(date.getTime())) return null;
  if (date > new Date()) return null;
  return calculateAge(date);
}

// define me this code:

