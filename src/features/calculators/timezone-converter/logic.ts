import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

/* ----------------------------------------------------------------- */
/*  Timezone data — grouped by region                                 */
/* ----------------------------------------------------------------- */

export interface TimezoneOption {
  value: string;   // IANA zone id
  label: string;   // human label
}

export interface TimezoneGroup {
  label: string;
  options: TimezoneOption[];
}

export const TIMEZONE_GROUPS: TimezoneGroup[] = [
  {
    label: "Reference",
    options: [
      { value: "UTC", label: "UTC — Coordinated Universal Time" },
    ],
  },
  {
    label: "Americas",
    options: [
      { value: "America/Los_Angeles", label: "Los Angeles (US Pacific)" },
      { value: "America/Denver", label: "Denver (US Mountain)" },
      { value: "America/Chicago", label: "Chicago (US Central)" },
      { value: "America/New_York", label: "New York (US Eastern)" },
      { value: "America/Toronto", label: "Toronto" },
      { value: "America/Mexico_City", label: "Mexico City" },
      { value: "America/Bogota", label: "Bogotá" },
      { value: "America/Sao_Paulo", label: "São Paulo" },
      { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
    ],
  },
  {
    label: "Europe",
    options: [
      { value: "Europe/London", label: "London" },
      { value: "Europe/Paris", label: "Paris" },
      { value: "Europe/Berlin", label: "Berlin" },
      { value: "Europe/Madrid", label: "Madrid" },
      { value: "Europe/Rome", label: "Rome" },
      { value: "Europe/Amsterdam", label: "Amsterdam" },
      { value: "Europe/Stockholm", label: "Stockholm" },
      { value: "Europe/Istanbul", label: "Istanbul" },
      { value: "Europe/Moscow", label: "Moscow" },
    ],
  },
  {
    label: "Middle East",
    options: [
      { value: "Asia/Dubai", label: "Dubai" },
      { value: "Asia/Riyadh", label: "Riyadh" },
      { value: "Asia/Tehran", label: "Tehran" },
      { value: "Asia/Jerusalem", label: "Jerusalem" },
    ],
  },
  {
    label: "Asia",
    options: [
      { value: "Asia/Karachi", label: "Karachi" },
      { value: "Asia/Kolkata", label: "Kolkata (IST)" },
      { value: "Asia/Dhaka", label: "Dhaka" },
      { value: "Asia/Bangkok", label: "Bangkok" },
      { value: "Asia/Singapore", label: "Singapore" },
      { value: "Asia/Hong_Kong", label: "Hong Kong" },
      { value: "Asia/Shanghai", label: "Shanghai" },
      { value: "Asia/Tokyo", label: "Tokyo" },
      { value: "Asia/Seoul", label: "Seoul" },
    ],
  },
  {
    label: "Pacific",
    options: [
      { value: "Australia/Sydney", label: "Sydney" },
      { value: "Australia/Perth", label: "Perth" },
      { value: "Pacific/Auckland", label: "Auckland" },
    ],
  },
  {
    label: "Africa",
    options: [
      { value: "Africa/Cairo", label: "Cairo" },
      { value: "Africa/Johannesburg", label: "Johannesburg" },
      { value: "Africa/Lagos", label: "Lagos" },
    ],
  },
];

/** Flat list — kept for lookups and back-compat. */
export const TIMEZONES: TimezoneOption[] = TIMEZONE_GROUPS.flatMap(
  (g) => g.options
);

export function findTimezone(zone: string): TimezoneOption | undefined {
  return TIMEZONES.find((t) => t.value === zone);
}

/** Common browser-reported aliases → canonical IANA id. */
export const TIMEZONE_ALIASES: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "Asia/Katmandu": "Asia/Kathmandu",
  "US/Eastern": "America/New_York",
  "US/Central": "America/Chicago",
  "US/Mountain": "America/Denver",
  "US/Pacific": "America/Los_Angeles",
  "GB": "Europe/London",
};

/* ----------------------------------------------------------------- */
/*  Conversion types + helpers                                        */
/* ----------------------------------------------------------------- */

export interface TimezoneResult {
  formatted: string;
  abbreviation: string;
  offset: string;
  dayShift: number;
  instant: Date;
}

function parseLocal(dateStr: string, timeStr: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return null;
  const d = new Date(`${dateStr}T${timeStr}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
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
  return m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${String(m).padStart(2, "0")}`;
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

export function convertTimezone(
  dateStr: string,
  timeStr: string,
  fromZone: string,
  toZone: string
): TimezoneResult | null {
  const naive = parseLocal(dateStr, timeStr);
  if (!naive) return null;

  const instant = fromZonedTime(naive, fromZone);

  const formatted = formatInTimeZone(
    instant,
    toZone,
    "EEE, MMM d, yyyy 'at' h:mm a"
  );

  const offsetMinutes = getOffsetMinutes(instant, toZone);
  const abbreviation = getAbbreviation(instant, toZone);

  const srcKey = getDayKey(instant, fromZone);
  const dstKey = getDayKey(instant, toZone);
  let dayShift = 0;
  if (srcKey !== dstKey) {
    const s = new Date(`${srcKey}T00:00:00Z`).getTime();
    const d = new Date(`${dstKey}T00:00:00Z`).getTime();
    dayShift = Math.round((d - s) / 86400000);
  }

  return {
    formatted,
    abbreviation,
    offset: formatOffset(offsetMinutes),
    dayShift,
    instant,
  };
}

export function nowInZone(zone: string): Date {
  return toZonedTime(new Date(), zone);
}

export function splitDateTime(instant: Date, zone: string) {
  const dateStr = formatInTimeZone(instant, zone, "yyyy-MM-dd");
  const timeStr = formatInTimeZone(instant, zone, "HH:mm");
  return { dateStr, timeStr };
}