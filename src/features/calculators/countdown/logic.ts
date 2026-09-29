export interface CountdownParts {
  /** Total milliseconds remaining (clamped to 0). */
  remainingMs: number;
  /** Whether the target has been reached. */
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Percent of the total duration elapsed (0–100). Null if duration is 0. */
  progress: number | null;
  /** Total duration from start to target (ms). */
  totalMs: number;
}

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function computeCountdown(
  target: Date | null,
  origin: Date | null,
  now: Date
): CountdownParts | null {
  if (!target) return null;

  const remainingMs = Math.max(0, target.getTime() - now.getTime());
  const totalMs = origin ? target.getTime() - origin.getTime() : remainingMs;
  const expired = remainingMs === 0;

  const days = Math.floor(remainingMs / DAY);
  const hours = Math.floor((remainingMs % DAY) / HOUR);
  const minutes = Math.floor((remainingMs % HOUR) / MIN);
  const seconds = Math.floor((remainingMs % MIN) / SEC);

  const progress =
    totalMs > 0
      ? Math.min(100, Math.max(0, ((totalMs - remainingMs) / totalMs) * 100))
      : null;

  return {
    remainingMs,
    expired,
    days,
    hours,
    minutes,
    seconds,
    progress,
    totalMs,
  };
}

export function parseDateTime(
  dateStr: string,
  timeStr: string
): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) return null;
  const t = timeStr.length === 5 ? timeStr + ":00" : timeStr;
  const d = new Date(`${dateStr}T${t}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/** Human-friendly summary like "in 3 days, 4 hours". */
export function summarize(parts: CountdownParts): string {
  if (parts.expired) return "Time's up";
  const bits: string[] = [];
  if (parts.days) bits.push(`${parts.days}d`);
  if (parts.hours) bits.push(`${parts.hours}h`);
  if (parts.minutes && !parts.days) bits.push(`${parts.minutes}m`);
  if (parts.seconds && !parts.days && !parts.hours) bits.push(`${parts.seconds}s`);
  return bits.length ? `in ${bits.join(" ")}` : "less than a second";
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

export interface Preset {
  label: string;
  /** Compute the target from "now". */
  target: (now: Date) => Date;
}

export const PRESETS: Preset[] = [
  {
    label: "5 min",
    target: (now) => new Date(now.getTime() + 5 * MIN),
  },
  {
    label: "15 min",
    target: (now) => new Date(now.getTime() + 15 * MIN),
  },
  {
    label: "1 hour",
    target: (now) => new Date(now.getTime() + HOUR),
  },
  {
    label: "Tomorrow",
    target: (now) => {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
  {
    label: "New Year",
    target: (now) => new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0),
  },
];