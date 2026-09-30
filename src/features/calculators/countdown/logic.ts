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

  const rawRemaining = Math.max(0, target.getTime() - now.getTime());
  const totalMs = origin ? target.getTime() - origin.getTime() : rawRemaining;

  // Never show more time than the full duration (guards against a slightly
  // stale tick right after pressing Start).
  const remainingMs =
    origin && totalMs > 0 ? Math.min(rawRemaining, totalMs) : rawRemaining;

  const expired = remainingMs === 0;

  // Round UP to whole seconds so a 5:00 timer shows 5:00 first, then 4:59...
  // and only shows 0:00 when the time has really run out.
  const remainingSec = Math.ceil(remainingMs / SEC);

  const days = Math.floor(remainingSec / 86400);
  const hours = Math.floor((remainingSec % 86400) / 3600);
  const minutes = Math.floor((remainingSec % 3600) / 60);
  const seconds = remainingSec % 60;

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

export function parseDateTime(dateStr: string, timeStr: string): Date | null {
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

/** Human-friendly summary like "in 3d 4h". */
export function summarize(parts: CountdownParts): string {
  if (parts.expired) return "Time's up";
  const bits: string[] = [];
  if (parts.days) bits.push(`${parts.days}d`);
  if (parts.hours) bits.push(`${parts.hours}h`);
  if (parts.minutes && !parts.days) bits.push(`${parts.minutes}m`);
  if (parts.seconds && !parts.days && !parts.hours)
    bits.push(`${parts.seconds}s`);
  return bits.length ? `in ${bits.join(" ")}` : "less than a second";
}

/* ------------------------------------------------------------------ */
/*  Custom duration                                                    */
/* ------------------------------------------------------------------ */

export type CustomUnit = "seconds" | "minutes" | "hours" | "days";

export const CUSTOM_UNITS: { value: CustomUnit; label: string; ms: number }[] =
  [
    { value: "seconds", label: "Seconds", ms: SEC },
    { value: "minutes", label: "Minutes", ms: MIN },
    { value: "hours", label: "Hours", ms: HOUR },
    { value: "days", label: "Days", ms: DAY },
  ];

/** Upper limit for a custom timer: 10 years. */
export const MAX_CUSTOM_MS = 3650 * DAY;

/**
 * Converts what the user typed (e.g. "2.5" + "minutes") to milliseconds.
 * Returns null if the input is empty, not a number, <= 0, or too large.
 */
export function customToMs(value: string, unit: CustomUnit): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  const unitMs = CUSTOM_UNITS.find((u) => u.value === unit)?.ms ?? SEC;
  const ms = Math.round(n * unitMs);
  if (ms < 1 || ms > MAX_CUSTOM_MS) return null;
  return ms;
}

/* ------------------------------------------------------------------ */
/*  Presets                                                            */
/* ------------------------------------------------------------------ */

export interface Preset {
  label: string;
  /**
   * Set for "5 min", "15 min", "1 hour". The real target is computed at the
   * moment Start is pressed, so the timer begins at exactly 5:00.
   */
  durationMs?: number;
  /** Used to fill the date/time inputs. */
  target: (now: Date) => Date;
}

export const PRESETS: Preset[] = [
  {
    label: "5 min",
    durationMs: 5 * MIN,
    target: (now) => new Date(now.getTime() + 5 * MIN),
  },
  {
    label: "15 min",
    durationMs: 15 * MIN,
    target: (now) => new Date(now.getTime() + 15 * MIN),
  },
  {
    label: "1 hour",
    durationMs: HOUR,
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