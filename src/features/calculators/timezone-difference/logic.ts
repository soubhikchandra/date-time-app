// // --------------------------------------------------
// // src/features/calculators/timezone-difference/logic.ts
// import cityTimezones from "city-timezones";
// import { findTimezone, TIMEZONE_ALIASES } from "@/features/calculators/timezone-converter/logic";

// /* ------------------------------------------------------------------ */
// /*  Types                                                              */
// /* ------------------------------------------------------------------ */

// export interface ZoneInfo {
//   zone: string;
//   label: string;
//   abbreviation: string;
//   offsetMinutes: number;
//   offsetLabel: string;
//   currentTime: string;
//   currentDate: string;
//   isDaytime: boolean;
// }

// export interface ZoneDifference {
//   from: ZoneInfo;
//   to: ZoneInfo;
//   diffMinutes: number;
//   diffLabel: string;
//   diffText: string;
//   sameZone: boolean;
// }

// export interface Option {
//   value: string;
//   label: string;
// }

// /* ------------------------------------------------------------------ */
// /*  City database — pre-grouped for fast lookups                       */
// /* ------------------------------------------------------------------ */

// type CityRecord = {
//   city: string;
//   city_ascii: string;
//   lat: number;
//   lng: number;
//   pop: number;
//   country: string;
//   iso2: string;
//   iso3: string;
//   province: string;
//   timezone: string;
// };

// const ALL_CITIES = cityTimezones.cityMapping as CityRecord[];

// /* Pre-built caches (built once at module load) */
// const countryNameByIso2 = new Map<string, string>();
// const statesByCountry = new Map<string, Set<string>>();
// const citiesByCountryState = new Map<string, CityRecord[]>();
// /** cityKey → timezone */
// const timezoneByCityKey = new Map<string, string>();
// /** cityKey → display label */
// const labelByCityKey = new Map<string, string>();

// (function buildCaches() {
//   for (const c of ALL_CITIES) {
//     if (!c.iso2 || !c.city) continue;

//     // Country
//     if (!countryNameByIso2.has(c.iso2)) {
//       countryNameByIso2.set(c.iso2, c.country);
//     }

//     // State (fallback to country name if missing)
//     const province = c.province?.trim() || c.country;
//     if (!statesByCountry.has(c.iso2)) statesByCountry.set(c.iso2, new Set());
//     statesByCountry.get(c.iso2)!.add(province);

//     // Cities per country + state
//     const stateKey = `${c.iso2}|${province}`;
//     if (!citiesByCountryState.has(stateKey)) {
//       citiesByCountryState.set(stateKey, []);
//     }
//     citiesByCountryState.get(stateKey)!.push(c);

//     // Lookup by full composite key
//     const cityKey = `${c.iso2}|${province}|${c.city}`;
//     timezoneByCityKey.set(cityKey, c.timezone);
//     labelByCityKey.set(cityKey, c.city);
//   }

//   // Sort each state's cities by population (descending)
//   for (const arr of citiesByCountryState.values()) {
//     arr.sort((a, b) => (b.pop ?? 0) - (a.pop ?? 0));
//   }
// })();

// /* ------------------------------------------------------------------ */
// /*  Option builders                                                    */
// /* ------------------------------------------------------------------ */

// export function getCountryOptions(): Option[] {
//   return Array.from(countryNameByIso2.entries())
//     .map(([value, label]) => ({ value, label }))
//     .sort((a, b) => a.label.localeCompare(b.label));
// }

// export function getStateOptions(countryIso2: string): Option[] {
//   const states = statesByCountry.get(countryIso2);
//   if (!states) return [];
//   return Array.from(states)
//     .map((label) => ({ value: label, label }))
//     .sort((a, b) => a.label.localeCompare(b.label));
// }

// export function getCityOptions(
//   countryIso2: string,
//   province: string
// ): Option[] {
//   const key = `${countryIso2}|${province}`;
//   const cities = citiesByCountryState.get(key);
//   if (!cities) return [];

//   // Deduplicate by city name — some entries repeat across data sources
//   const seen = new Set<string>();
//   const out: Option[] = [];
//   for (const c of cities) {
//     if (seen.has(c.city)) continue;
//     seen.add(c.city);
//     const cityKey = `${c.iso2}|${province}|${c.city}`;
//     out.push({ value: cityKey, label: c.city });
//   }
//   return out;
// }

// /** Given the composite cityKey, return the IANA timezone. */
// export function resolveTimezone(cityKey: string): string | null {
//   return timezoneByCityKey.get(cityKey) ?? null;
// }

// /** Given the composite cityKey, return the display label. */
// export function resolveCityLabel(cityKey: string): string {
//   return labelByCityKey.get(cityKey) ?? cityKey.split("|").pop() ?? cityKey;
// }

// /** Given an IANA zone, find a matching city record (first hit). */
// export function findCityForZone(zone: string): {
//   countryIso2: string;
//   province: string;
//   city: string;
//   cityKey: string;
// } | null {
//   const hit = ALL_CITIES.find((c) => c.timezone === zone);
//   if (!hit) return null;
//   const province = hit.province?.trim() || hit.country;
//   return {
//     countryIso2: hit.iso2,
//     province,
//     city: hit.city,
//     cityKey: `${hit.iso2}|${province}|${hit.city}`,
//   };
// }

// /* ------------------------------------------------------------------ */
// /*  Offset calculation (native Intl — DST-aware)                       */
// /* ------------------------------------------------------------------ */

// function getZoneOffsetMinutes(timeZone: string, date: Date): number {
//   try {
//     const dtf = new Intl.DateTimeFormat("en-US", {
//       timeZone,
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: false,
//     });

//     const parts = dtf.formatToParts(date);
//     const map: Record<string, string> = {};
//     parts.forEach((p) => {
//       if (p.type !== "literal") map[p.type] = p.value;
//     });

//     const asUTC = Date.UTC(
//       parseInt(map.year, 10),
//       parseInt(map.month, 10) - 1,
//       parseInt(map.day, 10),
//       parseInt(map.hour === "24" ? "0" : map.hour, 10),
//       parseInt(map.minute, 10),
//       parseInt(map.second, 10)
//     );

//     return Math.round((asUTC - date.getTime()) / 60_000);
//   } catch {
//     return 0;
//   }
// }

// function formatOffset(minutes: number): string {
//   const sign = minutes >= 0 ? "+" : "−";
//   const abs = Math.abs(minutes);
//   const h = Math.floor(abs / 60);
//   const m = abs % 60;
//   return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
// }

// function getZoneAbbreviation(timeZone: string, date: Date): string {
//   try {
//     const dtf = new Intl.DateTimeFormat("en-US", {
//       timeZone,
//       timeZoneName: "short",
//     });
//     const parts = dtf.formatToParts(date);
//     const namePart = parts.find((p) => p.type === "timeZoneName");
//     return namePart?.value ?? timeZone.split("/").pop() ?? "—";
//   } catch {
//     return "—";
//   }
// }

// function getCurrentTimeInZone(timeZone: string, date: Date): string {
//   try {
//     return new Intl.DateTimeFormat("en-US", {
//       timeZone,
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     }).format(date);
//   } catch {
//     return "—";
//   }
// }

// function getCurrentDateInZone(timeZone: string, date: Date): string {
//   try {
//     return new Intl.DateTimeFormat("en-US", {
//       timeZone,
//       month: "short",
//       day: "numeric",
//     }).format(date);
//   } catch {
//     return "—";
//   }
// }

// function isDaytimeInZone(timeZone: string, date: Date): boolean {
//   try {
//     const dtf = new Intl.DateTimeFormat("en-US", {
//       timeZone,
//       hour: "2-digit",
//       hour12: false,
//     });
//     const hour = parseInt(dtf.format(date), 10);
//     return hour >= 6 && hour < 18;
//   } catch {
//     return true;
//   }
// }

// /* ------------------------------------------------------------------ */
// /*  Zone info builder                                                  */
// /* ------------------------------------------------------------------ */

// export function getZoneInfo(zone: string, date: Date): ZoneInfo {
//   const offsetMinutes = getZoneOffsetMinutes(zone, date);
//   return {
//     zone,
//     label: findTimezone(zone)?.label ?? zone.split("/").pop() ?? zone,
//     abbreviation: getZoneAbbreviation(zone, date),
//     offsetMinutes,
//     offsetLabel: formatOffset(offsetMinutes),
//     currentTime: getCurrentTimeInZone(zone, date),
//     currentDate: getCurrentDateInZone(zone, date),
//     isDaytime: isDaytimeInZone(zone, date),
//   };
// }

// /* ------------------------------------------------------------------ */
// /*  Diff formatting                                                    */
// /* ------------------------------------------------------------------ */

// function formatDiffMinutes(minutes: number): string {
//   const abs = Math.abs(minutes);
//   const sign = minutes >= 0 ? "+" : "−";
//   const h = Math.floor(abs / 60);
//   const m = abs % 60;
//   if (h === 0) return `${sign}${m}m`;
//   if (m === 0) return `${sign}${h}h`;
//   return `${sign}${h}h ${m}m`;
// }

// function describeDiff(minutes: number): string {
//   const abs = Math.abs(minutes);
//   const h = Math.floor(abs / 60);
//   const m = abs % 60;

//   const parts: string[] = [];
//   if (h > 0) parts.push(`${h} hour${h === 1 ? "" : "s"}`);
//   if (m > 0) parts.push(`${m} minute${m === 1 ? "" : "s"}`);

//   return parts.join(" ");
// }

// /* ------------------------------------------------------------------ */
// /*  Main calculation                                                   */
// /* ------------------------------------------------------------------ */

// export function getZoneDifference(
//   fromZone: string,
//   toZone: string,
//   date: Date
// ): ZoneDifference {
//   const from = getZoneInfo(fromZone, date);
//   const to = getZoneInfo(toZone, date);

//   const diffMinutes = from.offsetMinutes - to.offsetMinutes;
//   const sameZone = fromZone === toZone;

//   let diffText: string;
//   if (sameZone) {
//     diffText = "Both zones are on the same time";
//   } else if (diffMinutes === 0) {
//     diffText = `${from.label} and ${to.label} are on the same time`;
//   } else if (diffMinutes > 0) {
//     diffText = `${from.label} is ${describeDiff(diffMinutes)} ahead of ${to.label}`;
//   } else {
//     diffText = `${from.label} is ${describeDiff(diffMinutes)} behind ${to.label}`;
//   }

//   return {
//     from,
//     to,
//     diffMinutes,
//     diffLabel: sameZone ? "0h" : formatDiffMinutes(diffMinutes),
//     diffText,
//     sameZone,
//   };
// }

// /* ------------------------------------------------------------------ */
// /*  Local zone detection                                               */
// /* ------------------------------------------------------------------ */

// export function detectLocalZone(): string {
//   try {
//     const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
//     return TIMEZONE_ALIASES[zone] ?? zone;
//   } catch {
//     return "UTC";
//   }
// }

// ---------------------------------------------------

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