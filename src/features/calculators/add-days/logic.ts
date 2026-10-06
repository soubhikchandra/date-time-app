import { addDays, differenceInDays } from "date-fns";

export interface AddDaysResult {
  /** The resulting date after adding N days. */
  result: Date;
  /** Original input date (parsed). */
  from: Date;
  /** How many days were added. */
  amount: number;
}

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getAddDays(
  dateStr: string,
  amountStr: string
): AddDaysResult | null {
  const from = parseDate(dateStr);
  if (!from) return null;

  const trimmed = amountStr.trim();
  if (trimmed === "") return null;

  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 0) {
    return null;
  }

  // Sanity cap so we don't scroll off the calendar.
  if (amount > 100_000) return null;

  return {
    result: addDays(from, amount),
    from,
    amount,
  };
}

/** Human-readable form used by the result panel and copy button. */
export function describeShift(result: AddDaysResult): string {
  const gap = differenceInDays(result.result, result.from);
  return `${gap.toLocaleString("en-US")} day${gap === 1 ? "" : "s"} later`;
}