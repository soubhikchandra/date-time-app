// src/features/calculators/sunrise-sunset/logic.ts
import * as SunCalc from "suncalc";
import cityTimezones from "city-timezones";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Option {
  value: string;
  label: string;
}

export interface SunDay {
  /** Solar events — null if the event doesn't occur (polar day/night). */
  sunrise: Date | null;
  sunset: Date | null;
  sunriseEnd: Date | null;
  sunsetStart: Date | null;
  dawn: Date | null;
  dusk: Date | null;
  nauticalDawn: Date | null;
  nauticalDusk: Date | null;
  astronomicalDawn: Date | null;
  astronomicalDusk: Date | null;
  solarNoon: Date | null;
  nadir: Date | null;
  goldenHourEnd: Date | null;
  goldenHour: Date | null;

  /** Duration in minutes */
  dayLengthMinutes: number | null;

  /** Location metadata */
  lat: number;
  lng: number;
  timezone: string;
}

/* ------------------------------------------------------------------ */
/*  City database — same cache pattern as timezone-difference          */
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

const countryNameByIso2 = new Map<string, string>();
const statesByCountry = new Map<string, Set<string>>();
/** "iso2|province|city" → CityRecord */
const cityByKey = new Map<string, CityRecord>();

(function buildCaches() {
  for (const c of ALL_CITIES) {
    if (!c.iso2 || !c.city) continue;

    if (!countryNameByIso2.has(c.iso2)) {
      countryNameByIso2.set(c.iso2, c.country);
    }

    const province = c.province?.trim() || c.country;
    if (!statesByCountry.has(c.iso2)) statesByCountry.set(c.iso2, new Set());
    statesByCountry.get(c.iso2)!.add(province);

    const key = `${c.iso2}|${province}|${c.city}`;
    if (!cityByKey.has(key)) cityByKey.set(key, c);
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

export function getCityOptions(countryIso2: string, state: string): Option[] {
  const out: Option[] = [];
  const seen = new Set<string>();

  for (const c of ALL_CITIES) {
    if (c.iso2 !== countryIso2) continue;
    const province = c.province?.trim() || c.country;
    if (province !== state) continue;
    if (seen.has(c.city)) continue;
    seen.add(c.city);
    out.push({
      value: `${c.iso2}|${province}|${c.city}`,
      label: c.city,
    });
  }

  return out.sort((a, b) => a.label.localeCompare(b.label));
}

/** Get full CityRecord from a composite city key. */
export function resolveCity(cityKey: string): CityRecord | null {
  return cityByKey.get(cityKey) ?? null;
}

/** Find a city from a user's current IANA timezone (best-effort). */
export function findCityForZone(zone: string): {
  countryIso2: string;
  province: string;
  cityKey: string;
} | null {
  const hit = ALL_CITIES.find((c) => c.timezone === zone);
  if (!hit) return null;
  const province = hit.province?.trim() || hit.country;
  return {
    countryIso2: hit.iso2,
    province,
    cityKey: `${hit.iso2}|${province}|${hit.city}`,
  };
}

/* ------------------------------------------------------------------ */
/*  Sun calculations                                                   */
/* ------------------------------------------------------------------ */

function validDate(d: unknown): Date | null {
  if (!d) return null;
  if (!(d instanceof Date)) return null;
  return !isNaN(d.getTime()) ? d : null;
}

export function getSunDay(
  date: Date,
  lat: number,
  lng: number,
  timezone: string
): SunDay {
  const times = SunCalc.getTimes(date, lat, lng);

  const sunrise = validDate(times.sunrise);
  const sunset = validDate(times.sunset);

  const dayLengthMinutes =
    sunrise && sunset
      ? Math.round((sunset.getTime() - sunrise.getTime()) / 60_000)
      : null;

  return {
    sunrise,
    sunset,
    sunriseEnd: validDate(times.sunriseEnd),
    sunsetStart: validDate(times.sunsetStart),
    dawn: validDate(times.dawn),
    dusk: validDate(times.dusk),
    nauticalDawn: validDate(times.nauticalDawn),
    nauticalDusk: validDate(times.nauticalDusk),
    astronomicalDawn: validDate(times.astronomicalDawn),
    astronomicalDusk: validDate(times.astronomicalDusk),
    solarNoon: validDate(times.solarNoon),
    nadir: validDate(times.nadir),
    goldenHourEnd: validDate(times.goldenHourEnd),
    goldenHour: validDate(times.goldenHour),
    dayLengthMinutes,
    lat,
    lng,
    timezone,
  };
}

/** Formats minutes into "12h 34m" */
export function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Formats a Date in the target timezone as "6:42 AM" */
export function formatTimeInZone(date: Date | null, timezone: string): string {
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return "—";
  }
}

/* ------------------------------------------------------------------ */
/*  Sun position (live)                                                */
/* ------------------------------------------------------------------ */

export interface SunPosition {
  /** Sun altitude in degrees */
  altitude: number;
  /** Sun azimuth in degrees (0=N, 90=E, 180=S, 270=W) */
  azimuth: number;
  /** Whether the sun is above the horizon */
  isUp: boolean;
  /** Compass direction the sun is in (e.g., "SE") */
  compass: string;
}

export function getSunPosition(
  date: Date,
  lat: number,
  lng: number
): SunPosition {
  const pos = SunCalc.getPosition(date, lat, lng);
  // altitude & azimuth are in radians; azimuth is measured from south
  const altitudeDeg = (pos.altitude * 180) / Math.PI;
  const azimuthDeg = ((pos.azimuth * 180) / Math.PI + 180 + 360) % 360;

  return {
    altitude: altitudeDeg,
    azimuth: azimuthDeg,
    isUp: altitudeDeg > 0,
    compass: compassFromAzimuth(azimuthDeg),
  };
}

function compassFromAzimuth(az: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(az / 45) % 8;
  return dirs[idx];
}

/* ------------------------------------------------------------------ */
/*  Local zone detection                                               */
/* ------------------------------------------------------------------ */

export function detectLocalZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function detectLocalDate(): Date {
  return new Date();
}