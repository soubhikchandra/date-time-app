// src/features/calculators/calendar/logic.ts
import Holidays from "date-holidays";
import { format,addDays } from "date-fns";
import { ChineseDate, type LocaleCode } from "chinese-lunar-date";
import * as SunCalc from "suncalc";

const hd = new Holidays();

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type HolidayCategory = "public" | "festival" | "regional" | "observance";

export interface HolidayItem {
  date: Date;
  dateString: string;
  name: string;
  type: string;
  category: HolidayCategory;
  substitute?: boolean;
}

export interface SunTimes {
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date | null;
  dawn: Date | null;
  dusk: Date | null;
}

/* ------------------------------------------------------------------ */
/*  Lunar system map                                                   */
/* ------------------------------------------------------------------ */

export type LunarSystem =
  | { type: "chinese-lunar-date"; locale: LocaleCode }
  | { type: "intl"; calendar: string };

export const LUNAR_SYSTEM_MAP: Record<string, LunarSystem> = {
  CN: { type: "chinese-lunar-date", locale: "zh-CN" },
  TW: { type: "chinese-lunar-date", locale: "zh-TW" },
  HK: { type: "chinese-lunar-date", locale: "zh-HK" },
  JP: { type: "chinese-lunar-date", locale: "ja-JP" },
  KR: { type: "chinese-lunar-date", locale: "ko-KR" },
  VN: { type: "chinese-lunar-date", locale: "vi-VN" },

  IL: { type: "intl", calendar: "hebrew" },
  SA: { type: "intl", calendar: "islamic-civil" },
  IR: { type: "intl", calendar: "persian" },
  IN: { type: "intl", calendar: "indian" },
  TH: { type: "intl", calendar: "buddhist" },
  ET: { type: "intl", calendar: "ethiopic" },
};

/* ------------------------------------------------------------------ */
/*  Coordinates                                                        */
/* ------------------------------------------------------------------ */

export const INDIA_COORDINATES: Record<
  string,
  { lat: number; lng: number; tz: number; iana: string }
> = {
  default: { lat: 28.6139, lng: 77.2090, tz: 330, iana: "Asia/Kolkata" },
  WB: { lat: 22.5726, lng: 88.3639, tz: 330, iana: "Asia/Kolkata" },
  MH: { lat: 19.0760, lng: 72.8777, tz: 330, iana: "Asia/Kolkata" },
  TN: { lat: 13.0827, lng: 80.2707, tz: 330, iana: "Asia/Kolkata" },
  KA: { lat: 12.9716, lng: 77.5946, tz: 330, iana: "Asia/Kolkata" },
  KL: { lat: 8.5241, lng: 76.9366, tz: 330, iana: "Asia/Kolkata" },
  UP: { lat: 26.8467, lng: 80.9462, tz: 330, iana: "Asia/Kolkata" },
  GJ: { lat: 23.0225, lng: 72.5714, tz: 330, iana: "Asia/Kolkata" },
  RJ: { lat: 26.9124, lng: 75.7873, tz: 330, iana: "Asia/Kolkata" },
  MP: { lat: 22.7196, lng: 75.8577, tz: 330, iana: "Asia/Kolkata" },
  AP: { lat: 17.3850, lng: 78.4867, tz: 330, iana: "Asia/Kolkata" },
  TS: { lat: 17.3850, lng: 78.4867, tz: 330, iana: "Asia/Kolkata" },
  BR: { lat: 25.5941, lng: 85.1376, tz: 330, iana: "Asia/Kolkata" },
  OR: { lat: 20.2961, lng: 85.8245, tz: 330, iana: "Asia/Kolkata" },
  AS: { lat: 26.1445, lng: 91.7362, tz: 330, iana: "Asia/Kolkata" },
  PB: { lat: 30.9010, lng: 75.8573, tz: 330, iana: "Asia/Kolkata" },
  HR: { lat: 29.0588, lng: 76.0856, tz: 330, iana: "Asia/Kolkata" },
  JH: { lat: 23.3441, lng: 85.3096, tz: 330, iana: "Asia/Kolkata" },
  CG: { lat: 21.2514, lng: 81.6296, tz: 330, iana: "Asia/Kolkata" },
  UK: { lat: 30.3165, lng: 78.0322, tz: 330, iana: "Asia/Kolkata" },
  HP: { lat: 31.1048, lng: 77.1734, tz: 330, iana: "Asia/Kolkata" },
  GA: { lat: 15.2993, lng: 74.1240, tz: 330, iana: "Asia/Kolkata" },
};

export const WORLD_COORDINATES: Record<string, { lat: number; lng: number }> = {
  IN: { lat: 28.6139, lng: 77.2090 },
  US: { lat: 38.9072, lng: -77.0369 },
  GB: { lat: 51.5074, lng: -0.1278 },
  AU: { lat: -33.8688, lng: 151.2093 },
  CA: { lat: 45.4215, lng: -75.6972 },
  DE: { lat: 52.5200, lng: 13.4050 },
  FR: { lat: 48.8566, lng: 2.3522 },
  JP: { lat: 35.6762, lng: 139.6503 },
  CN: { lat: 39.9042, lng: 116.4074 },
  KR: { lat: 37.5665, lng: 126.9780 },
  VN: { lat: 21.0278, lng: 105.8342 },
  IL: { lat: 31.7683, lng: 35.2137 },
  SA: { lat: 24.7136, lng: 46.6753 },
  IR: { lat: 35.6892, lng: 51.3890 },
  TH: { lat: 13.7563, lng: 100.5018 },
  ET: { lat: 9.0320, lng: 38.7469 },
  BR: { lat: -15.8267, lng: -47.9218 },
  MX: { lat: 19.4326, lng: -99.1332 },
  ZA: { lat: -25.7479, lng: 28.2293 },
  NG: { lat: 9.0765, lng: 7.3986 },
  EG: { lat: 30.0444, lng: 31.2357 },
};

function getIndiaCoords(stateCode?: string) {
  if (stateCode && INDIA_COORDINATES[stateCode]) {
    return INDIA_COORDINATES[stateCode];
  }
  return INDIA_COORDINATES.default;
}

function getWorldCoords(countryCode: string): { lat: number; lng: number } | null {
  return WORLD_COORDINATES[countryCode] ?? null;
}

/* ------------------------------------------------------------------ */
/*  Category classification                                            */
/* ------------------------------------------------------------------ */

export function classifyHoliday(type: string): HolidayCategory {
  switch (type) {
    case "public":
    case "bank":
    case "government":
      return "public";
    case "optional":
    case "unofficial":
    case "festival":
      return "festival";
    case "school":
    case "half_day":
    case "armed_forces":
    case "de_facto":
      return "regional";
    case "observance":
    case "workday":
    default:
      return "observance";
  }
}

/* ------------------------------------------------------------------ */
/*  Base holidays (date-holidays)                                      */
/* ------------------------------------------------------------------ */

function getBaseHolidays(
  countryCode: string,
  year: number,
  state?: string,
  region?: string
): HolidayItem[] {
  try {
    if (state && region) hd.init(countryCode, state, region);
    else if (state) hd.init(countryCode, state);
    else hd.init(countryCode);

    try {
      hd.setLanguages("en");
    } catch {
      /* ignore */
    }

    return hd.getHolidays(year).map((h) => {
      const d = new Date(h.date);
      return {
        date: d,
        dateString: format(d, "yyyy-MM-dd"),
        name: h.name,
        type: h.type,
        category: classifyHoliday(h.type),
        substitute: h.substitute,
      };
    });
  } catch (error) {
    console.error("date-holidays error:", error);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Chinese lunar festivals                                            */
/* ------------------------------------------------------------------ */

function getChineseLunarFestivals(
  year: number,
  locale: LocaleCode
): HolidayItem[] {
  const results: HolidayItem[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    try {
      const lunar = ChineseDate.fromGregorian(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate()
      );

      const anyLunar = lunar as unknown as {
        getFestivals?: (
          loc: string
        ) => Array<{ name?: string; festivalName?: string } | string>;
      };

      if (typeof anyLunar.getFestivals !== "function") continue;

      const festivals = anyLunar.getFestivals(locale) || [];
      festivals.forEach((f: { name?: string; festivalName?: string } | string) => {
        const name =
          typeof f === "string" ? f : f.name ?? f.festivalName ?? "Festival";
        results.push({
          date: new Date(d),
          dateString: format(d, "yyyy-MM-dd"),
          name,
          type: "festival",
          category: "festival",
        });
      });
    } catch {
      /* skip */
    }
  }

  return results;
}

/* ------------------------------------------------------------------ */
/*  Merge helpers                                                      */
/* ------------------------------------------------------------------ */

function mergeHolidays(
  base: HolidayItem[],
  extra: HolidayItem[]
): HolidayItem[] {
  const seen = new Set<string>();
  const merged: HolidayItem[] = [];

  [...base, ...extra].forEach((h) => {
    const key = `${h.dateString}|${h.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(h);
    }
  });

  return merged.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/* ------------------------------------------------------------------ */
/*  Unified holiday fetcher                                            */
/* ------------------------------------------------------------------ */

export function getHolidays(
  countryCode: string,
  year: number,
  state?: string,
  region?: string
): HolidayItem[] {
  const base = getBaseHolidays(countryCode, year, state, region);
  const lunarSystem = LUNAR_SYSTEM_MAP[countryCode];

  if (lunarSystem?.type === "chinese-lunar-date") {
    const festivals = getChineseLunarFestivals(year, lunarSystem.locale);
    return mergeHolidays(base, festivals);
  }

  return base;
}

/* ------------------------------------------------------------------ */
/*  Geographic data                                                    */
/* ------------------------------------------------------------------ */

export function getAllCountries() {
  try {
    const countryMap = hd.getCountries("en");
    return Object.entries(countryMap)
      .map(([code, label]) => ({ value: code, label: label as string }))
      .sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
}

export function getStatesForCountry(countryCode: string) {
  try {
    return hd.getStates(countryCode, "en") ?? {};
  } catch (error) {
    console.error(`Error fetching states for ${countryCode}:`, error);
    return {};
  }
}

export function getRegionsForState(countryCode: string, stateCode: string) {
  try {
    return hd.getRegions(countryCode, stateCode, "en") ?? {};
  } catch (error) {
    console.error(`Error fetching regions for ${countryCode}-${stateCode}:`, error);
    return {};
  }
}

export function getCountryOptions() {
  return getAllCountries();
}

export function getStateOptions(countryCode: string) {
  const states = getStatesForCountry(countryCode);
  return Object.entries(states)
    .map(([value, label]) => ({ value, label: label as string }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getRegionOptions(countryCode: string, stateCode: string) {
  const regions = getRegionsForState(countryCode, stateCode);
  return Object.entries(regions)
    .map(([value, label]) => ({ value, label: label as string }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/* ------------------------------------------------------------------ */
/*  Lunar date display                                                 */
/* ------------------------------------------------------------------ */

export function getLunarDateLabel(
  date: Date,
  countryCode: string
): string | null {
  try {
    const system = LUNAR_SYSTEM_MAP[countryCode];
    if (!system) return null;

    if (system.type === "intl") {
      return new Intl.DateTimeFormat(`en-u-ca-${system.calendar}`, {
        dateStyle: "long",
      }).format(date);
    }

    const lunar = ChineseDate.fromGregorian(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    return lunar.formatFull(system.locale);
  } catch (error) {
    console.error("Error formatting lunar date:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Sunrise / Sunset                                                   */
/* ------------------------------------------------------------------ */

export function getSunTimes(
  date: Date,
  countryCode: string,
  stateCode?: string
): SunTimes | null {
  try {
    let coords: { lat: number; lng: number } | null = null;

    if (countryCode === "IN") {
      const c = getIndiaCoords(stateCode);
      coords = { lat: c.lat, lng: c.lng };
    } else {
      coords = getWorldCoords(countryCode);
    }

    if (!coords) return null;

    const times = SunCalc.getTimes(date, coords.lat, coords.lng);

    // Accept null | undefined | invalid Date from suncalc
    const validDate = (d: Date | null | undefined): Date | null =>
      d && !isNaN(d.getTime()) ? d : null;

    return {
      sunrise: validDate(times.sunrise),
      sunset: validDate(times.sunset),
      solarNoon: validDate(times.solarNoon),
      dawn: validDate(times.dawn),
      dusk: validDate(times.dusk),
    };
  } catch (error) {
    console.error("Error calculating sun times:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Long Weekend Finder                                                */
/* ------------------------------------------------------------------ */

export interface LongWeekend {
  id: string;
  start: Date;
  end: Date;
  daysOff: number;
  holidayNames: string[];
}

/**
 * Scans the year and returns all runs of 3+ consecutive off-days
 * (weekends + holidays merged).
 */
export function getLongWeekends(
  holidays: HolidayItem[],
  year: number
): LongWeekend[] {
  const holidayByDate = new Map<string, HolidayItem[]>();
  holidays.forEach((h) => {
    if (!holidayByDate.has(h.dateString)) holidayByDate.set(h.dateString, []);
    holidayByDate.get(h.dateString)!.push(h);
  });

  const offDaySet = new Set<string>();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    const key = format(d, "yyyy-MM-dd");
    if (dow === 0 || dow === 6) offDaySet.add(key);
    if (holidayByDate.has(key)) offDaySet.add(key);
  }

  const longWeekends: LongWeekend[] = [];
  let runStart: Date | null = null;
  let runEnd: Date | null = null;
  let runHolidayNames: string[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = format(d, "yyyy-MM-dd");
    const isOff = offDaySet.has(key);

    if (isOff) {
      if (!runStart) {
        runStart = new Date(d);
        runHolidayNames = [];
      }
      runEnd = new Date(d);
      const hs = holidayByDate.get(key);
      if (hs) runHolidayNames.push(...hs.map((h) => h.name));
    } else {
      if (runStart && runEnd) {
        const daysOff =
          Math.round((runEnd.getTime() - runStart.getTime()) / 86400000) + 1;
        if (daysOff >= 3) {
          longWeekends.push({
            id: `${format(runStart, "yyyy-MM-dd")}-${format(runEnd, "yyyy-MM-dd")}`,
            start: new Date(runStart),
            end: new Date(runEnd),
            daysOff,
            holidayNames: [...new Set(runHolidayNames)],
          });
        }
      }
      runStart = null;
      runEnd = null;
      runHolidayNames = [];
    }
  }

  return longWeekends;
}

/* ------------------------------------------------------------------ */
/*  Bridge Day Suggester                                               */
/* ------------------------------------------------------------------ */

export interface BridgeSuggestion {
  id: string;
  leaveDate: Date;
  holiday: HolidayItem;
  breakStart: Date;
  breakEnd: Date;
  totalDaysOff: number;
}

/**
 * For each weekday holiday, suggest the single leave day that turns it
 * into the longest possible break. Weekends and other holidays are
 * treated as already-off when measuring the resulting break.
 */
export function getBridgeSuggestions(
  holidays: HolidayItem[]
): BridgeSuggestion[] {
  const holidayDates = new Set(holidays.map((h) => h.dateString));

  const isOff = (d: Date): boolean => {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) return true;
    return holidayDates.has(format(d, "yyyy-MM-dd"));
  };

  const suggestions: BridgeSuggestion[] = [];
  const seen = new Set<string>();

  for (const h of holidays) {
    const d = h.date;
    const dow = d.getDay();

    // Skip holidays already on a weekend
    if (dow === 0 || dow === 6) continue;

    let leaveDay: Date | null = null;
    if (dow === 2) leaveDay = addDays(d, -1); // Tue → Mon
    else if (dow === 4) leaveDay = addDays(d, 1); // Thu → Fri
    else if (dow === 1) leaveDay = addDays(d, -3); // Mon → prev Fri
    else if (dow === 5) leaveDay = addDays(d, 3); // Fri → next Mon
    else if (dow === 3) leaveDay = addDays(d, -1); // Wed → Tue

    if (!leaveDay) continue;
    if (isOff(leaveDay)) continue;

    const key = format(leaveDay, "yyyy-MM-dd");
    if (seen.has(key)) continue;
    seen.add(key);

    // Walk back/forward to measure the resulting consecutive break
    let bs = new Date(leaveDay);
    let be = new Date(leaveDay);
    while (isOff(addDays(bs, -1))) bs = addDays(bs, -1);
    while (isOff(addDays(be, 1))) be = addDays(be, 1);

    const daysOff =
      Math.round((be.getTime() - bs.getTime()) / 86400000) + 1;
    if (daysOff < 3) continue;

    suggestions.push({
      id: `${key}-${h.dateString}`,
      leaveDate: leaveDay,
      holiday: h,
      breakStart: bs,
      breakEnd: be,
      totalDaysOff: daysOff,
    });
  }

  return suggestions.sort(
    (a, b) => a.leaveDate.getTime() - b.leaveDate.getTime()
  );
}