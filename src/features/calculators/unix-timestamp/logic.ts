import { formatInTimeZone } from "date-fns-tz";

export interface TimestampResult {
  /** Seconds since Unix epoch. */
  seconds: number;
  /** Milliseconds since Unix epoch. */
  milliseconds: number;
  /** ISO 8601 string in UTC. */
  iso: string;
  /** UTC wall-clock, e.g. "Mon, Sep 29, 2026 at 9:30:45 AM". */
  utcFormatted: string;
  /** Local wall-clock for the same instant. */
  localFormatted: string;
  /** IANA zone detected from the browser. */
  localZone: string;
  /** Relative label like "3 days ago" / "in 2 hours" / "just now". */
  relative: string;
}

function getLocalZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/* ------------------------------------------------------------------ */
/*  Timestamp → Date                                                   */
/* ------------------------------------------------------------------ */

/** Accepts seconds (10 digits) or milliseconds (13 digits). */
export function parseTimestamp(input: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (!/^-?\d+$/.test(trimmed)) return null;

  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;

  // Absolute value < 1e11 → treat as seconds (covers years 1..5138).
  const ms = Math.abs(n) < 1e11 ? n * 1000 : n;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d;
}

/* ------------------------------------------------------------------ */
/*  Date → Timestamp                                                   */
/* ------------------------------------------------------------------ */

export function parseDateTime(dateStr: string, timeStr: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) return null;
  const d = new Date(`${dateStr}T${timeStr.length === 5 ? timeStr + ":00" : timeStr}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/* ------------------------------------------------------------------ */
/*  Snapshot builder                                                   */
/* ------------------------------------------------------------------ */

export function buildSnapshot(instant: Date): TimestampResult {
  const ms = instant.getTime();
  const seconds = Math.floor(ms / 1000);
  const localZone = getLocalZone();

  return {
    seconds,
    milliseconds: ms,
    iso: instant.toISOString(),
    utcFormatted: formatInTimeZone(
      instant,
      "UTC",
      "EEE, MMM d, yyyy 'at' h:mm:ss a"
    ),
    localFormatted: formatInTimeZone(
      instant,
      localZone,
      "EEE, MMM d, yyyy 'at' h:mm:ss a"
    ),
    localZone,
    relative: relativeFromNow(instant),
  };
}

/* ------------------------------------------------------------------ */
/*  Relative time ("3 days ago")                                       */
/* ------------------------------------------------------------------ */

function relativeFromNow(instant: Date): string {
  const diffMs = instant.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const future = diffMs > 0;

  const sec = 1000;
  const min = 60 * sec;
  const hour = 60 * min;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (abs < 5 * sec) return "just now";

  const plural = (n: number, unit: string) =>
    `${n} ${unit}${n === 1 ? "" : "s"}`;

  let value: string;
  if (abs < min) value = plural(Math.round(abs / sec), "second");
  else if (abs < hour) value = plural(Math.round(abs / min), "minute");
  else if (abs < day) value = plural(Math.round(abs / hour), "hour");
  else if (abs < week) value = plural(Math.round(abs / day), "day");
  else if (abs < month) value = plural(Math.round(abs / week), "week");
  else if (abs < year) value = plural(Math.round(abs / month), "month");
  else value = plural(Math.round(abs / year), "year");

  return future ? `in ${value}` : `${value} ago`;
}

/* ------------------------------------------------------------------ */
/*  Current timestamp (for the reference card)                         */
/* ------------------------------------------------------------------ */

export function currentSeconds(): number {
  return Math.floor(Date.now() / 1000);
}