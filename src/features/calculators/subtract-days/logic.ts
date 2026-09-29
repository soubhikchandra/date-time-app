import { subDays } from "date-fns";

export interface SubtractDaysResult {
  /** The resulting date after subtracting N days. */
  result: Date;
  /** Original input date (parsed). */
  from: Date;
  /** How many days were subtracted. */
  amount: number;
}

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getSubtractDays(
  dateStr: string,
  amountStr: string
): SubtractDaysResult | null {
  const from = parseDate(dateStr);
  if (!from) return null;

  const trimmed = amountStr.trim();
  if (trimmed === "") return null;

  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 0) {
    return null;
  }

  if (amount > 100_000) return null;

  return {
    result: subDays(from, amount),
    from,
    amount,
  };
}