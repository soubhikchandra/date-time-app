// --------------------------------------------------------
// src/features/calculators/timezone-difference/logic.ts
import cityTimezones from "city-timezones";
import { findTimezone, TIMEZONE_ALIASES } from "@/features/calculators/timezone-converter/logic";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ZoneInfo {
  zone: string;
  label: string;
  abbreviation: string;
  offsetMinutes: number;
  offsetLabel: string;
  currentTime: string;
  currentDate: string;
  isDaytime: boolean;
}

export interface ZoneDifference {
  from: ZoneInfo;
  to: ZoneInfo;
  diffMinutes: number;
  diffLabel: string;
  diffText: string;
  sameZone: boolean;
}

export interface Option {
  value: string;
  label: string;
}

/* ------------------------------------------------------------------ */
/*  City database — pre-grouped for fast lookups                       */
/* ------------------------------------------------------------------ */

type CityRecord = {
  city: string;
  city_ascii: string;
  lat: number;
  lng: number;
  pop: number;
  country: string;
  iso2: string;
  iso3: string;
  province: string;
  timezone: string;
};

const ALL_CITIES = cityTimezones.cityMapping as CityRecord[];

/* Pre-built caches (built once at module load) */
const countryNameByIso2 = new Map<string, string>();
const statesByCountry = new Map<string, Set<string>>();
const citiesByCountryState = new Map<string, CityRecord[]>();
/** "iso2|province" → representative timezone (from most populous city) */
const timezoneByStateKey = new Map<string, string>();

(function buildCaches() {
  for (const c of ALL_CITIES) {
    if (!c.iso2 || !c.city) continue;

    if (!countryNameByIso2.has(c.iso2)) {
      countryNameByIso2.set(c.iso2, c.country);
    }

    const province = c.province?.trim() || c.country;
    if (!statesByCountry.has(c.iso2)) statesByCountry.set(c.iso2, new Set());
    statesByCountry.get(c.iso2)!.add(province);

    const stateKey = `${c.iso2}|${province}`;
    if (!citiesByCountryState.has(stateKey)) {
      citiesByCountryState.set(stateKey, []);
    }
    citiesByCountryState.get(stateKey)!.push(c);
  }

  // Sort cities per state by population desc, then pick the top one's timezone
  for (const [stateKey, cities] of citiesByCountryState.entries()) {
    cities.sort((a, b) => (b.pop ?? 0) - (a.pop ?? 0));
    if (cities[0]?.timezone) {
      timezoneByStateKey.set(stateKey, cities[0].timezone);
    }
  }
})();

/* ------------------------------------------------------------------ */
/*  Option builders                                                    */
/* ------------------------------------------------------------------ */

export function getCountryOptions(): Option[] {
  return Array.from(countryNameByIso2.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getStateOptions(countryIso2: string): Option[] {
  const states = statesByCountry.get(countryIso2);
  if (!states) return [];
  return Array.from(states)
    .map((label) => ({ value: label, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Resolve the IANA timezone for a (country, state) pair. */
export function resolveTimezone(
  countryIso2: string,
  state: string
): string | null {
  return timezoneByStateKey.get(`${countryIso2}|${state}`) ?? null;
}

/** Given an IANA zone, find a matching country + state. */
export function findLocationForZone(zone: string): {
  countryIso2: string;
  state: string;
} | null {
  const hit = ALL_CITIES.find((c) => c.timezone === zone);
  if (!hit) return null;
  return {
    countryIso2: hit.iso2,
    state: hit.province?.trim() || hit.country,
  };
}

/* ------------------------------------------------------------------ */
/*  Offset calculation (native Intl — DST-aware)                       */
/* ------------------------------------------------------------------ */

function getZoneOffsetMinutes(timeZone: string, date: Date): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = dtf.formatToParts(date);
    const map: Record<string, string> = {};
    parts.forEach((p) => {
      if (p.type !== "literal") map[p.type] = p.value;
    });

    const asUTC = Date.UTC(
      parseInt(map.year, 10),
      parseInt(map.month, 10) - 1,
      parseInt(map.day, 10),
      parseInt(map.hour === "24" ? "0" : map.hour, 10),
      parseInt(map.minute, 10),
      parseInt(map.second, 10)
    );

    return Math.round((asUTC - date.getTime()) / 60_000);
  } catch {
    return 0;
  }
}

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "−";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getZoneAbbreviation(timeZone: string, date: Date): string {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    });
    const parts = dtf.formatToParts(date);
    const namePart = parts.find((p) => p.type === "timeZoneName");
    return namePart?.value ?? timeZone.split("/").pop() ?? "—";
  } catch {
    return "—";
  }
}

function getCurrentTimeInZone(timeZone: string, date: Date): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return "—";
  }
}

function getCurrentDateInZone(timeZone: string, date: Date): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

function isDaytimeInZone(timeZone: string, date: Date): boolean {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      hour12: false,
    });
    const hour = parseInt(dtf.format(date), 10);
    return hour >= 6 && hour < 18;
  } catch {
    return true;
  }
}

/* ------------------------------------------------------------------ */
/*  Zone info builder                                                  */
/* ------------------------------------------------------------------ */

export function getZoneInfo(zone: string, date: Date): ZoneInfo {
  const offsetMinutes = getZoneOffsetMinutes(zone, date);
  return {
    zone,
    label: findTimezone(zone)?.label ?? zone.split("/").pop() ?? zone,
    abbreviation: getZoneAbbreviation(zone, date),
    offsetMinutes,
    offsetLabel: formatOffset(offsetMinutes),
    currentTime: getCurrentTimeInZone(zone, date),
    currentDate: getCurrentDateInZone(zone, date),
    isDaytime: isDaytimeInZone(zone, date),
  };
}

/* ------------------------------------------------------------------ */
/*  Diff formatting                                                    */
/* ------------------------------------------------------------------ */

function formatDiffMinutes(minutes: number): string {
  const abs = Math.abs(minutes);
  const sign = minutes >= 0 ? "+" : "−";
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}

function describeDiff(minutes: number): string {
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h} hour${h === 1 ? "" : "s"}`);
  if (m > 0) parts.push(`${m} minute${m === 1 ? "" : "s"}`);

  return parts.join(" ");
}

/* ------------------------------------------------------------------ */
/*  Main calculation                                                   */
/* ------------------------------------------------------------------ */

export function getZoneDifference(
  fromZone: string,
  toZone: string,
  date: Date
): ZoneDifference {
  const from = getZoneInfo(fromZone, date);
  const to = getZoneInfo(toZone, date);

  const diffMinutes = from.offsetMinutes - to.offsetMinutes;
  const sameZone = fromZone === toZone;

  let diffText: string;
  if (sameZone) {
    diffText = "Both locations are on the same time";
  } else if (diffMinutes === 0) {
    diffText = `${from.label} and ${to.label} are on the same time`;
  } else if (diffMinutes > 0) {
    diffText = `${from.label} is ${describeDiff(diffMinutes)} ahead of ${to.label}`;
  } else {
    diffText = `${from.label} is ${describeDiff(diffMinutes)} behind ${to.label}`;
  }

  return {
    from,
    to,
    diffMinutes,
    diffLabel: sameZone ? "0h" : formatDiffMinutes(diffMinutes),
    diffText,
    sameZone,
  };
}

/* ------------------------------------------------------------------ */
/*  Local zone detection                                               */
/* ------------------------------------------------------------------ */

export function detectLocalZone(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    return TIMEZONE_ALIASES[zone] ?? zone;
  } catch {
    return "UTC";
  }
}

/* ------------------------------------------------------------------ */
/*  Country name lookup + label builder                                */
/* ------------------------------------------------------------------ */

export function getCountryName(iso2: string): string {
  return countryNameByIso2.get(iso2) ?? iso2;
}

export function makeCityLabel(countryIso2: string, state: string): string {
  const country = getCountryName(countryIso2);
  return state ? `${state}, ${country}` : country;
}

/* ------------------------------------------------------------------ */
/*  Business-hours helpers                                             */
/* ------------------------------------------------------------------ */

export const BUSINESS_START = 9;
export const BUSINESS_END = 18;

export function isBusinessHour(hour24: number): boolean {
  return hour24 >= BUSINESS_START && hour24 < BUSINESS_END;
}

export function isAwakeHour(hour24: number): boolean {
  return hour24 >= 6 && hour24 < 22;
}

export function getCityLocalHour(zone: string, date: Date): number {
  try {
    const h = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour: "2-digit",
      hour12: false,
    }).format(date);
    return parseInt(h, 10) % 24;
  } catch {
    return 0;
  }
}

/* ------------------------------------------------------------------ */
/*  Multi-city comparison                                              */
/* ------------------------------------------------------------------ */

export interface MultiCityEntry {
  id: string;
  countryIso2: string;
  state: string;
  zone: string;
}

export interface MultiCityRow extends MultiCityEntry {
  info: ZoneInfo;
  diffMinutes: number;
  diffLabel: string;
  isSameAsReference: boolean;
  label: string;
  /** -1, 0, or +1 relative to the reference day */
  dayShift: number;
  /** Local hour in this city (0-23) */
  localHour: number;
  /** 9 AM – 6 PM local */
  inBusinessHours: boolean;
  /** 6 AM – 10 PM local */
  inAwakeHours: boolean;
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

export function getMultiCityComparison(
  referenceZone: string,
  cities: MultiCityEntry[],
  date: Date
): MultiCityRow[] {
  const refDayKey = getDayKey(date, referenceZone);

  return cities.map((c) => {
    const diff = getZoneDifference(referenceZone, c.zone, date);

    const cityDayKey = getDayKey(date, c.zone);
    let dayShift = 0;
    if (refDayKey !== cityDayKey) {
      const s = new Date(`${refDayKey}T00:00:00Z`).getTime();
      const d = new Date(`${cityDayKey}T00:00:00Z`).getTime();
      dayShift = Math.round((d - s) / 86400000);
    }

    const localHour = getCityLocalHour(c.zone, date);

    return {
      ...c,
      info: diff.to,
      diffMinutes: diff.diffMinutes,
      diffLabel: diff.diffLabel,
      isSameAsReference: diff.sameZone,
      label: makeCityLabel(c.countryIso2, c.state),
      dayShift,
      localHour,
      inBusinessHours: isBusinessHour(localHour),
      inAwakeHours: isAwakeHour(localHour),
    };
  });
}

/* ------------------------------------------------------------------ */
/*  ID + seed helpers                                                  */
/* ------------------------------------------------------------------ */

export function makeCityId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const SEED_COUNTRIES: { iso2: string; preferred: string[] }[] = [
  { iso2: "JP", preferred: ["Tokyo", "Tokyo-to", "Kanto"] },
  { iso2: "GB", preferred: ["England", "Greater London"] },
  { iso2: "US", preferred: ["New York", "New York State"] },
];

/**
 * Prefills a multi-city list with Tokyo, London, and New York.
 * Skips any city whose zone matches the given excluded zone
 * (usually the user's own reference zone).
 */
export function seedCities(excludeZone: string): MultiCityEntry[] {
  const out: MultiCityEntry[] = [];
  for (const seed of SEED_COUNTRIES) {
    const states = getStateOptions(seed.iso2);
    if (states.length === 0) continue;

    let state = states[0].value;
    for (const pref of seed.preferred) {
      if (states.some((s) => s.value === pref)) {
        state = pref;
        break;
      }
    }

    const zone = resolveTimezone(seed.iso2, state);
    if (!zone || zone === excludeZone) continue;

    out.push({
      id: makeCityId(),
      countryIso2: seed.iso2,
      state,
      zone,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Sort by offset                                                     */
/* ------------------------------------------------------------------ */

export type SortMode = "added" | "east-west" | "west-east";

export function sortRows(
  rows: MultiCityRow[],
  mode: SortMode
): MultiCityRow[] {
  if (mode === "added") return rows;
  return [...rows].sort((a, b) =>
    mode === "east-west"
      ? b.info.offsetMinutes - a.info.offsetMinutes
      : a.info.offsetMinutes - b.info.offsetMinutes
  );
}

/* ------------------------------------------------------------------ */
/*  Heatmap                                                            */
/* ------------------------------------------------------------------ */

export type HeatCellLevel = "sleep" | "awake" | "business";

export interface HeatmapRow {
  id: string;
  label: string;
  cells: HeatCellLevel[];
}

export interface Heatmap {
  hours: number[];
  rows: HeatmapRow[];
  /** For each reference-hour, count of cities in business hours */
  businessPerHour: number[];
  /** Current reference-local hour (0-23) */
  currentHour: number;
}

export function getHeatmap(
  refZone: string,
  cities: MultiCityEntry[],
  date: Date
): Heatmap {
  const refOffset = getZoneOffsetMinutes(refZone, date);
  const currentHour = getCityLocalHour(refZone, date);

  const rows: HeatmapRow[] = [];
  const businessPerHour = new Array(24).fill(0) as number[];

  for (const c of cities) {
    const cityOffset = getZoneOffsetMinutes(c.zone, date);
    const diffHours = (cityOffset - refOffset) / 60;

    const cells: HeatCellLevel[] = [];
    for (let h = 0; h < 24; h++) {
      const localHour = (((h + diffHours) % 24) + 24) % 24;
      const level: HeatCellLevel = isBusinessHour(localHour)
        ? "business"
        : isAwakeHour(localHour)
          ? "awake"
          : "sleep";
      cells.push(level);
      if (level === "business") businessPerHour[h]++;
    }

    rows.push({
      id: c.id,
      label: makeCityLabel(c.countryIso2, c.state),
      cells,
    });
  }

  return {
    hours: Array.from({ length: 24 }, (_, i) => i),
    rows,
    businessPerHour,
    currentHour,
  };
}

/* ------------------------------------------------------------------ */
/*  Best call window                                                   */
/* ------------------------------------------------------------------ */

export interface BestCallWindow {
  /** Reference-local hours where at least 1 city is in business hours */
  someHours: number[];
  /** Reference-local hours where ALL cities + reference are in business hours */
  allHours: number[];
  /** Reference-local hours where ≥60% are in business hours */
  majorityHours: number[];
  /** Count of cities currently in business hours (excludes reference) */
  citiesInBusinessNow: number;
  /** Total cities compared */
  totalCities: number;
}

export function getBestCallWindow(
  refZone: string,
  cities: MultiCityEntry[],
  date: Date
): BestCallWindow {
  const refOffset = getZoneOffsetMinutes(refZone, date);
  const totalCities = cities.length + 1;

  const someHours: number[] = [];
  const allHours: number[] = [];
  const majorityHours: number[] = [];

  for (let h = 0; h < 24; h++) {
    const refBiz = isBusinessHour(h);
    let count = refBiz ? 1 : 0;

    for (const c of cities) {
      const cityOffset = getZoneOffsetMinutes(c.zone, date);
      const diffHours = (cityOffset - refOffset) / 60;
      const localHour = (((h + diffHours) % 24) + 24) % 24;
      if (isBusinessHour(localHour)) count++;
    }

    if (count > 0) someHours.push(h);
    if (count === totalCities) allHours.push(h);
    if (count / totalCities >= 0.6) majorityHours.push(h);
  }

  // Right now
  const refHour = getCityLocalHour(refZone, date);
  let nowCount = 0;
  for (const c of cities) {
    const cityOffset = getZoneOffsetMinutes(c.zone, date);
    const diffHours = (cityOffset - refOffset) / 60;
    const localHour = (((refHour + diffHours) % 24) + 24) % 24;
    if (isBusinessHour(localHour)) nowCount++;
  }

  return {
    someHours,
    allHours,
    majorityHours,
    citiesInBusinessNow: nowCount,
    totalCities,
  };
}

/** Compact "09:00–11:00, 14:00–16:00" from a list of hours. */
export function formatHourRanges(hours: number[]): string {
  if (hours.length === 0) return "None";
  const ranges: [number, number][] = [];
  let start = hours[0];
  let prev = hours[0];

  for (let i = 1; i < hours.length; i++) {
    if (hours[i] === prev + 1) {
      prev = hours[i];
    } else {
      ranges.push([start, prev]);
      start = hours[i];
      prev = hours[i];
    }
  }
  ranges.push([start, prev]);

  return ranges
    .map(
      ([s, e]) =>
        `${String(s).padStart(2, "0")}:00–${String(e + 1).padStart(2, "0")}:00`
    )
    .join(", ");
}

/* ------------------------------------------------------------------ */
/*  CSV export                                                         */
/* ------------------------------------------------------------------ */

export function toMultiCityCsv(
  referenceLabel: string,
  rows: MultiCityRow[]
): string {
  const header = [
    "reference_label",
    "city_label",
    "time",
    "abbreviation",
    "offset",
    "difference_from_reference",
    "day_shift",
    "business_hours",
  ].join(",");

  const lines = [header];
  for (const r of rows) {
    lines.push(
      [
        `"${referenceLabel}"`,
        `"${r.label}"`,
        `"${r.info.currentTime}"`,
        r.info.abbreviation,
        r.info.offsetLabel,
        r.diffLabel,
        r.dayShift.toString(),
        r.inBusinessHours ? "yes" : "no",
      ].join(",")
    );
  }
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  ICS export                                                         */
/* ------------------------------------------------------------------ */

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toIcsDate(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}` +
    `T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`
  );
}

function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

export function buildMultiCityIcs(
  referenceLabel: string,
  rows: MultiCityRow[],
  date: Date
): string {
  const dtstamp = toIcsDate(new Date());
  const dtStart = toIcsDate(date);
  const dtEnd = toIcsDate(new Date(date.getTime() + 30 * 60_000));

  const summary = `Timezone comparison — ${rows.length} cities`;
  const descLines = [
    `Reference: ${referenceLabel}`,
    "",
    ...rows.map(
      (r) =>
        `${r.label}: ${r.info.currentTime} ${r.info.abbreviation} (${r.diffLabel})`
    ),
  ];

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Date & Time//Timezone Comparison//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:tz-compare-${date.getTime()}@datetime.app`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(descLines.join("\n"))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

/* ------------------------------------------------------------------ */
/*  DST Transition Tracker                                             */
/* ------------------------------------------------------------------ */

export interface DstTransition {
  /** The exact UTC instant when the offset changed */
  date: Date;
  /** Offset in minutes before the transition */
  fromOffset: number;
  /** Offset in minutes after the transition */
  toOffset: number;
  /** "+00:00" style label for the offset before */
  fromLabel: string;
  /** "+01:00" style label for the offset after */
  toLabel: string;
  /** "forward" = clocks jump ahead (spring), "backward" = clocks fall back */
  direction: "forward" | "backward";
  /** Positive = added time, negative = lost time (usually ±60 or ±30) */
  deltaMinutes: number;
}

/**
 * Finds all DST transitions for a given IANA zone in a given year.
 * Scans day-by-day using Intl offsets, then binary-searches down to
 * 1-minute resolution to find the exact transition moment.
 */
export function getDstTransitions(
  zone: string,
  year: number
): DstTransition[] {
  const transitions: DstTransition[] = [];
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const STEP = 24 * 60 * 60 * 1000; // 24 hours
  const MINUTE = 60 * 1000;

  let prevOffset = getZoneOffsetMinutes(zone, new Date(start));
  let prevTime = start;

  for (let t = start + STEP; t <= end; t += STEP) {
    const curOffset = getZoneOffsetMinutes(zone, new Date(t));
    if (curOffset !== prevOffset) {
      // Binary search between prevTime (old offset) and t (new offset)
      let lo = prevTime;
      let hi = t;
      while (hi - lo > MINUTE) {
        const mid = Math.floor((lo + hi) / 2);
        const midOffset = getZoneOffsetMinutes(zone, new Date(mid));
        if (midOffset === prevOffset) lo = mid;
        else hi = mid;
      }
      // Snap to the nearest minute
      const exact = new Date(Math.round(hi / MINUTE) * MINUTE);
      transitions.push({
        date: exact,
        fromOffset: prevOffset,
        toOffset: curOffset,
        fromLabel: formatOffset(prevOffset),
        toLabel: formatOffset(curOffset),
        direction: curOffset > prevOffset ? "forward" : "backward",
        deltaMinutes: curOffset - prevOffset,
      });
      prevOffset = curOffset;
      prevTime = t;
    } else {
      prevTime = t;
    }
  }

  return transitions;
}

/** True if the zone observes DST in the given year. */
export function hasDstInYear(zone: string, year: number): boolean {
  return getDstTransitions(zone, year).length > 0;
}