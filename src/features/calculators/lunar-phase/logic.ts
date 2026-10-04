// src/features/calculators/lunar-phase/logic.ts
import * as SunCalc from "suncalc";
import cityTimezones from "city-timezones";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Option {
  value: string;
  label: string;
}

export type MoonPhaseName =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent";

export interface MoonInfo {
  /** 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter */
  phase: number;
  /** Illuminated fraction: 0 to 1 */
  fraction: number;
  /** Angle in radians */
  angle: number;
  /** Human-readable phase name */
  name: MoonPhaseName;
  /** Percentage of the moon that is illuminated */
  illuminationPct: number;
  /** Whether the moon is waxing (growing) */
  isWaxing: boolean;
}

export interface MoonEvent {
  label: "New Moon" | "First Quarter" | "Full Moon" | "Last Quarter";
  date: Date;
}

export interface MoonTimes {
  moonrise: Date | null;
  moonset: Date | null;
  alwaysUp: boolean;
  alwaysDown: boolean;
}

export interface MoonPositionInfo {
  /** Degrees above the horizon (-90 to 90). Negative = below horizon. */
  altitude: number;
  /** Compass azimuth: 0 = N, 90 = E, 180 = S, 270 = W */
  azimuth: number;
  /** 16-point compass label: "N", "NNE", "NE", … */
  compass: string;
  /** Distance from Earth center to Moon, in km */
  distance: number;
  /** Distance in Earth radii (1 = 6371 km) */
  distanceEarthRadii: number;
  /** Angle of the lit limb's brightness — degrees */
  parallacticAngle: number;
  /** Above horizon? */
  isUp: boolean;
  /** 0 = perigee (closest), 1 = apogee (farthest) */
  distanceNorm: number;
  /** Moon illumination snapshot from the same instant */
  illuminationPct: number;
  phaseName: MoonPhaseName;
}

export interface BestViewingHint {
  isVisibleNow: boolean;
  hoursUntilRise: number | null;
  quality: "excellent" | "good" | "low" | "hidden";
}

/* ------------------------------------------------------------------ */
/*  City database (same pattern as sunrise-sunset)                     */
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
    out.push({ value: `${c.iso2}|${province}|${c.city}`, label: c.city });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

export function resolveCity(cityKey: string): CityRecord | null {
  return cityByKey.get(cityKey) ?? null;
}

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

export function detectLocalZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/* ------------------------------------------------------------------ */
/*  Moon phase                                                         */
/* ------------------------------------------------------------------ */

const PHASE_NAMES: { min: number; name: MoonPhaseName }[] = [
  { min: 0.9375, name: "New Moon" },
  { min: 0.8125, name: "Waning Crescent" },
  { min: 0.6875, name: "Last Quarter" },
  { min: 0.5625, name: "Waning Gibbous" },
  { min: 0.4375, name: "Full Moon" },
  { min: 0.3125, name: "Waxing Gibbous" },
  { min: 0.1875, name: "First Quarter" },
  { min: 0.0625, name: "Waxing Crescent" },
  { min: 0, name: "New Moon" },
];

function nameFromPhase(phase: number): MoonPhaseName {
  for (const { min, name } of PHASE_NAMES) {
    if (phase >= min) return name;
  }
  return "New Moon";
}

export function getMoonInfo(date: Date): MoonInfo {
  const illum = SunCalc.getMoonIllumination(date);
  return {
    phase: illum.phase,
    fraction: illum.fraction,
    angle: illum.angle,
    name: nameFromPhase(illum.phase),
    illuminationPct: Math.round(illum.fraction * 100),
    isWaxing: illum.phase < 0.5,
  };
}

/* ------------------------------------------------------------------ */
/*  Next 4 moon events                                                 */
/* ------------------------------------------------------------------ */

export function getNextMoonEvents(start: Date, count = 4): MoonEvent[] {
  const events: MoonEvent[] = [];
  const targets: { target: number; label: MoonEvent["label"] }[] = [
    { target: 0, label: "New Moon" },
    { target: 0.25, label: "First Quarter" },
    { target: 0.5, label: "Full Moon" },
    { target: 0.75, label: "Last Quarter" },
  ];

  const STEP_MS = 6 * 60 * 60 * 1000;
  const maxSteps = Math.ceil((60 * 24 * 60 * 60 * 1000) / STEP_MS);
  const startMs = start.getTime();

  for (const { target, label } of targets) {
    let prevPhase = SunCalc.getMoonIllumination(new Date(startMs)).phase;
    let found: Date | null = null;

    for (let i = 1; i <= maxSteps; i++) {
      const t = startMs + i * STEP_MS;
      const phase = SunCalc.getMoonIllumination(new Date(t)).phase;

      const crossed =
        (target === 0 && phase < prevPhase) ||
        (target !== 0 && prevPhase < target && phase >= target);

      if (crossed) {
        found = new Date(t);
        break;
      }
      prevPhase = phase;
    }

    if (found) events.push({ label, date: found });
  }

  return events
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, count);
}

/* ------------------------------------------------------------------ */
/*  Moonrise / moonset                                                 */
/* ------------------------------------------------------------------ */

function validDate(d: unknown): Date | null {
  if (!d) return null;
  if (!(d instanceof Date)) return null;
  return !isNaN(d.getTime()) ? d : null;
}

export function getMoonTimes(
  date: Date,
  lat: number,
  lng: number
): MoonTimes {
  const times = SunCalc.getMoonTimes(date, lat, lng);
  return {
    moonrise: validDate(times.rise),
    moonset: validDate(times.set),
    alwaysUp: times.alwaysUp ?? false,
    alwaysDown: times.alwaysDown ?? false,
  };
}

export function formatTimeInZone(date: Date | null, tz: string): string {
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return "—";
  }
}

/* ------------------------------------------------------------------ */
/*  Moon Compass                                                       */
/* ------------------------------------------------------------------ */

const COMPASS_16 = [
  "N", "NNE", "NE", "ENE",
  "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW",
  "W", "WNW", "NW", "NNW",
];

export function compassFromAzimuth(az: number): string {
  const norm = ((az % 360) + 360) % 360;
  const idx = Math.round(norm / 22.5) % 16;
  return COMPASS_16[idx];
}

function normalizeDistance(km: number): number {
  const min = 356_500;
  const max = 406_700;
  return Math.max(0, Math.min(1, (km - min) / (max - min)));
}

export function getMoonPositionInfo(
  date: Date,
  lat: number,
  lng: number
): MoonPositionInfo {
  const pos = SunCalc.getMoonPosition(date, lat, lng);

  const altitudeDeg = (pos.altitude * 180) / Math.PI;
  const azimuthDeg = (((pos.azimuth * 180) / Math.PI) + 180 + 360) % 360;

  const illum = SunCalc.getMoonIllumination(date);

  return {
    altitude: altitudeDeg,
    azimuth: azimuthDeg,
    compass: compassFromAzimuth(azimuthDeg),
    distance: pos.distance,
    distanceEarthRadii: pos.distance / 6371,
    parallacticAngle: (pos.parallacticAngle * 180) / Math.PI,
    isUp: altitudeDeg > 0,
    distanceNorm: normalizeDistance(pos.distance),
    illuminationPct: Math.round(illum.fraction * 100),
    phaseName: nameFromPhase(illum.phase),
  };
}

export function getBestViewingHint(
  positionInfo: MoonPositionInfo,
  moonrise: Date | null,
  date: Date
): BestViewingHint {
  if (!positionInfo.isUp) {
    let hoursUntilRise: number | null = null;
    if (moonrise && moonrise.getTime() > date.getTime()) {
      hoursUntilRise = (moonrise.getTime() - date.getTime()) / 3_600_000;
    }
    return { isVisibleNow: false, hoursUntilRise, quality: "hidden" };
  }

  if (positionInfo.altitude > 30 && positionInfo.illuminationPct > 40) {
    return { isVisibleNow: true, hoursUntilRise: null, quality: "excellent" };
  }
  if (positionInfo.altitude > 15) {
    return { isVisibleNow: true, hoursUntilRise: null, quality: "good" };
  }
  return { isVisibleNow: true, hoursUntilRise: null, quality: "low" };
}