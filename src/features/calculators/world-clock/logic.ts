import { formatInTimeZone } from "date-fns-tz";

export interface WorldClockEntry {
  id: string;
  city: string;
  country: string;
  zone: string;
}

/** Curated starting set — user can add/remove. */
export const DEFAULT_CITIES: WorldClockEntry[] = [
  { id: "sf", city: "San Francisco", country: "United States", zone: "America/Los_Angeles" },
  { id: "ny", city: "New York", country: "United States", zone: "America/New_York" },
  { id: "ldn", city: "London", country: "United Kingdom", zone: "Europe/London" },
  { id: "par", city: "Paris", country: "France", zone: "Europe/Paris" },
  { id: "dxb", city: "Dubai", country: "United Arab Emirates", zone: "Asia/Dubai" },
  { id: "kol", city: "Kolkata", country: "India", zone: "Asia/Kolkata" },
  { id: "tky", city: "Tokyo", country: "Japan", zone: "Asia/Tokyo" },
  { id: "syd", city: "Sydney", country: "Australia", zone: "Australia/Sydney" },
];

export interface ZoneSnapshot {
  time: string;        // "9:30:45 AM"
  timeShort: string;   // "9:30 AM"
  date: string;        // "Mon, Sep 29"
  weekday: string;     // "Monday"
  abbreviation: string;// "IST"
  offset: string;      // "UTC+5:30"
  hour24: number;      // 0–23 for day/night
  isDaytime: boolean;
  dayShift: number;    // days difference from local (e.g. +1, -1, 0)
}

function getOffsetMinutes(instant: Date, zone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);

  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);

  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );

  return Math.round((asUTC - instant.getTime()) / 60000);
}

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0
    ? `UTC${sign}${h}`
    : `UTC${sign}${h}:${String(m).padStart(2, "0")}`;
}

function getAbbreviation(instant: Date, zone: string): string {
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "short",
    })
      .formatToParts(instant)
      .find((p) => p.type === "timeZoneName")?.value ?? zone
  );
}

function getDayKey(instant: Date, zone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${m}-${d}`;
}

export function getSnapshot(instant: Date, zone: string, localZone: string): ZoneSnapshot {
  const time = formatInTimeZone(instant, zone, "h:mm:ss a");
  const timeShort = formatInTimeZone(instant, zone, "h:mm a");
  const date = formatInTimeZone(instant, zone, "EEE, MMM d");
  const weekday = formatInTimeZone(instant, zone, "EEEE");
  const hour24 = Number(formatInTimeZone(instant, zone, "H"));

  const offsetMinutes = getOffsetMinutes(instant, zone);
  const abbreviation = getAbbreviation(instant, zone);

  const srcKey = getDayKey(instant, localZone);
  const dstKey = getDayKey(instant, zone);
  let dayShift = 0;
  if (srcKey !== dstKey) {
    const s = new Date(`${srcKey}T00:00:00Z`).getTime();
    const d = new Date(`${dstKey}T00:00:00Z`).getTime();
    dayShift = Math.round((d - s) / 86400000);
  }

  return {
    time,
    timeShort,
    date,
    weekday,
    abbreviation,
    offset: formatOffset(offsetMinutes),
    hour24,
    isDaytime: hour24 >= 6 && hour24 < 18,
    dayShift,
  };
}

export function detectLocalZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}