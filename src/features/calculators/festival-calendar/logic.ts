// // src/features/calculators/festival-calendar/logic.ts
// import Holidays from "date-holidays";
// import { format } from "date-fns";
// import { ChineseDate, type LocaleCode } from "chinese-lunar-date";
// import { computeFestivals, allRules } from "panchanga";
// import type { GeoLocation } from "panchanga";

// const hd = new Holidays();

// /* ------------------------------------------------------------------ */
// /*  Types                                                              */
// /* ------------------------------------------------------------------ */

// export type Religion =
//   | "christian"
//   | "islamic"
//   | "hindu"
//   | "jewish"
//   | "buddhist"
//   | "east-asian"
//   | "secular";

// export interface FestivalItem {
//   date: Date;
//   dateString: string;
//   name: string;
//   religion: Religion;
//   source: "date-holidays" | "chinese-lunar" | "intl-islamic" | "intl-hebrew" | "panchanga";
// }

// export interface ReligionMeta {
//   label: string;
//   dot: string;
//   text: string;
//   bg: string;
// }

// export const RELIGION_META: Record<Religion, ReligionMeta> = {
//   christian:   { label: "Christian",     dot: "bg-sky-500",     text: "text-sky-700 dark:text-sky-300",         bg: "bg-sky-100 dark:bg-sky-500/20" },
//   islamic:     { label: "Islamic",       dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
//   hindu:       { label: "Hindu",         dot: "bg-orange-500",  text: "text-orange-700 dark:text-orange-300",   bg: "bg-orange-100 dark:bg-orange-500/20" },
//   jewish:      { label: "Jewish",        dot: "bg-violet-500",  text: "text-violet-700 dark:text-violet-300",   bg: "bg-violet-100 dark:bg-violet-500/20" },
//   buddhist:    { label: "Buddhist",      dot: "bg-amber-500",   text: "text-amber-700 dark:text-amber-300",     bg: "bg-amber-100 dark:bg-amber-500/20" },
//   "east-asian":{ label: "East Asian",    dot: "bg-red-500",     text: "text-red-700 dark:text-red-300",         bg: "bg-red-100 dark:bg-red-500/20" },
//   secular:     { label: "Secular / Civic", dot: "bg-slate-400", text: "text-slate-700 dark:text-slate-300",     bg: "bg-slate-100 dark:bg-slate-500/20" },
// };

// export const ALL_RELIGIONS: Religion[] = [
//   "christian",
//   "islamic",
//   "hindu",
//   "jewish",
//   "buddhist",
//   "east-asian",
//   "secular",
// ];

// /* ------------------------------------------------------------------ */
// /*  India state coordinates (for panchanga)                            */
// /* ------------------------------------------------------------------ */

// const INDIA_COORDS: Record<string, { lat: number; lng: number; iana: string }> = {
//   default: { lat: 28.6139, lng: 77.2090, iana: "Asia/Kolkata" },
//   WB: { lat: 22.5726, lng: 88.3639, iana: "Asia/Kolkata" },
//   MH: { lat: 19.0760, lng: 72.8777, iana: "Asia/Kolkata" },
//   TN: { lat: 13.0827, lng: 80.2707, iana: "Asia/Kolkata" },
//   KA: { lat: 12.9716, lng: 77.5946, iana: "Asia/Kolkata" },
//   KL: { lat: 8.5241, lng: 76.9366, iana: "Asia/Kolkata" },
//   UP: { lat: 26.8467, lng: 80.9462, iana: "Asia/Kolkata" },
//   GJ: { lat: 23.0225, lng: 72.5714, iana: "Asia/Kolkata" },
//   RJ: { lat: 26.9124, lng: 75.7873, iana: "Asia/Kolkata" },
//   MP: { lat: 22.7196, lng: 75.8577, iana: "Asia/Kolkata" },
//   AP: { lat: 17.3850, lng: 78.4867, iana: "Asia/Kolkata" },
//   TS: { lat: 17.3850, lng: 78.4867, iana: "Asia/Kolkata" },
//   BR: { lat: 25.5941, lng: 85.1376, iana: "Asia/Kolkata" },
//   OR: { lat: 20.2961, lng: 85.8245, iana: "Asia/Kolkata" },
//   AS: { lat: 26.1445, lng: 91.7362, iana: "Asia/Kolkata" },
//   PB: { lat: 30.9010, lng: 75.8573, iana: "Asia/Kolkata" },
//   HR: { lat: 29.0588, lng: 76.0856, iana: "Asia/Kolkata" },
//   JH: { lat: 23.3441, lng: 85.3096, iana: "Asia/Kolkata" },
//   CG: { lat: 21.2514, lng: 81.6296, iana: "Asia/Kolkata" },
//   UK: { lat: 30.3165, lng: 78.0322, iana: "Asia/Kolkata" },
//   HP: { lat: 31.1048, lng: 77.1734, iana: "Asia/Kolkata" },
//   GA: { lat: 15.2993, lng: 74.1240, iana: "Asia/Kolkata" },
// };

// function getIndiaCoords(stateCode?: string) {
//   if (stateCode && INDIA_COORDS[stateCode]) return INDIA_COORDS[stateCode];
//   return INDIA_COORDS.default;
// }

// /* ------------------------------------------------------------------ */
// /*  Religion inference from holiday name                               */
// /* ------------------------------------------------------------------ */

// const NAME_PATTERNS: { pattern: RegExp; religion: Religion }[] = [
//   { pattern: /christmas|easter|good friday|ascension|pentecost|assumption|all saints|epiphany|corpus christi|advent|holy (thursday|saturday|week)|nativity|annunciation|candlemas|reformation day|christ the king|sacred heart|immaculate/i, religion: "christian" },
//   { pattern: /ramadan|eid\b|eid al|muharram|ashura|mawlid|isra|mi'raj|arafah|hijri|laylat al-qadr|prophet'?s birthday|islamic new year/i, religion: "islamic" },
//   { pattern: /diwali|deepavali|holi|navratri|dussehra|dasara|durga|kali puja|lakshmi|ganesh|pongal|onam|raksha bandhan|karva chauth|janmashtami|ram navami|maha shivaratri|shivaratri|vasant panchami|baisakhi|vaisakhi|gudi padwa|ugadi|thaipusam|thaipongal|makar sankranti|chhath|raja parba|nuakhai|bihu/i, religion: "hindu" },
//   { pattern: /hanukkah|chanukah|passover|pesach|yom kippur|rosh hashana|purim|shavuot|sukkot|simchat torah|shmini atzeret|tisha b'av|lag ba'omer|tu bishvat/i, religion: "jewish" },
//   { pattern: /vesak|vesakha|buddha|vassa|asarnha|magha puja|kathina|loy krathong|thingyan/i, religion: "buddhist" },
//   { pattern: /lunar new year|chinese new year|mid-autumn|dragon boat|qingming|chuseok|tet\b|seollal/i, religion: "east-asian" },
// ];

// function inferReligion(name: string): Religion {
//   for (const { pattern, religion } of NAME_PATTERNS) {
//     if (pattern.test(name)) return religion;
//   }
//   return "secular";
// }

// /* ------------------------------------------------------------------ */
// /*  Source 1 — date-holidays                                           */
// /* ------------------------------------------------------------------ */

// function getDateHolidays(
//   countryCode: string,
//   year: number,
//   state?: string,
//   region?: string
// ): FestivalItem[] {
//   try {
//     if (state && region) hd.init(countryCode, state, region);
//     else if (state) hd.init(countryCode, state);
//     else hd.init(countryCode);

//     try { hd.setLanguages("en"); } catch { /* ignore */ }

//     return hd.getHolidays(year).map((h) => {
//       const d = new Date(h.date);
//       return {
//         date: d,
//         dateString: format(d, "yyyy-MM-dd"),
//         name: h.name,
//         religion: inferReligion(h.name),
//         source: "date-holidays" as const,
//       };
//     });
//   } catch {
//     return [];
//   }
// }

// /* ------------------------------------------------------------------ */
// /*  Source 2 — chinese-lunar-date (East Asian)                         */
// /* ------------------------------------------------------------------ */

// const ASIAN_LOCALES: LocaleCode[] = ["zh-CN", "ja-JP", "ko-KR", "vi-VN"];

// function getEastAsianFestivals(year: number): FestivalItem[] {
//   const results: FestivalItem[] = [];
//   const seen = new Set<string>();
//   const start = new Date(year, 0, 1);
//   const end = new Date(year, 11, 31);

//   for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
//     for (const locale of ASIAN_LOCALES) {
//       try {
//         const lunar = ChineseDate.fromGregorian(
//           d.getFullYear(),
//           d.getMonth() + 1,
//           d.getDate()
//         );
//         const anyLunar = lunar as unknown as {
//           getFestivals?: (loc: string) => Array<{ name?: string; festivalName?: string } | string>;
//         };
//         if (typeof anyLunar.getFestivals !== "function") continue;

//         const list = anyLunar.getFestivals(locale) || [];
//         list.forEach((f) => {
//           const name = typeof f === "string" ? f : f.name ?? f.festivalName ?? "Festival";
//           const key = `${format(d, "yyyy-MM-dd")}|${name}`;
//           if (seen.has(key)) return;
//           seen.add(key);
//           results.push({
//             date: new Date(d),
//             dateString: format(d, "yyyy-MM-dd"),
//             name,
//             religion: "east-asian",
//             source: "chinese-lunar",
//           });
//         });
//       } catch {
//         /* skip */
//       }
//     }
//   }
//   return results;
// }

// /* ------------------------------------------------------------------ */
// /*  Source 3 — Islamic (Intl enumeration)                              */
// /* ------------------------------------------------------------------ */

// const ISLAMIC_TARGETS: { month: string; day: number; name: string }[] = [
//   { month: "Muharram",     day: 1,  name: "Islamic New Year" },
//   { month: "Muharram",     day: 10, name: "Ashura" },
//   { month: "Rabiʻ I",      day: 12, name: "Mawlid (Prophet's Birthday)" },
//   { month: "Rajab",        day: 27, name: "Isra and Mi'raj" },
//   { month: "Shaʻban",      day: 15, name: "Mid-Sha'ban" },
//   { month: "Ramadan",      day: 1,  name: "Ramadan begins" },
//   { month: "Ramadan",      day: 27, name: "Laylat al-Qadr" },
//   { month: "Shawwal",      day: 1,  name: "Eid al-Fitr" },
//   { month: "Dhuʻl-Hijjah", day: 9,  name: "Day of Arafah" },
//   { month: "Dhuʻl-Hijjah", day: 10, name: "Eid al-Adha" },
// ];

// function getIslamicFestivals(year: number): FestivalItem[] {
//   const results: FestivalItem[] = [];
//   const seen = new Set<string>();

//   const fmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
//     day: "numeric",
//     month: "long",
//   });

//   const start = new Date(year, 0, 1);
//   const end = new Date(year + 1, 1, 1);

//   for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
//     const parts = fmt.formatToParts(d);
//     const month = parts.find((p) => p.type === "month")?.value ?? "";
//     const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "0", 10);

//     for (const t of ISLAMIC_TARGETS) {
//       if (t.month === month && t.day === day) {
//         const key = `${format(d, "yyyy-MM-dd")}|${t.name}`;
//         if (seen.has(key)) continue;
//         seen.add(key);
//         results.push({
//           date: new Date(d),
//           dateString: format(d, "yyyy-MM-dd"),
//           name: t.name,
//           religion: "islamic",
//           source: "intl-islamic",
//         });
//       }
//     }
//   }

//   return results.filter((r) => r.date.getFullYear() === year);
// }

// /* ------------------------------------------------------------------ */
// /*  Source 4 — Jewish (Intl enumeration)                               */
// /* ------------------------------------------------------------------ */

// const JEWISH_TARGETS: { month: string; day: number; name: string }[] = [
//   { month: "Tishri", day: 1,  name: "Rosh Hashanah" },
//   { month: "Tishri", day: 10, name: "Yom Kippur" },
//   { month: "Tishri", day: 15, name: "Sukkot" },
//   { month: "Tishri", day: 22, name: "Shmini Atzeret" },
//   { month: "Kislev", day: 25, name: "Hanukkah" },
//   { month: "Shevat", day: 15, name: "Tu BiShvat" },
//   { month: "Adar",   day: 14, name: "Purim" },
//   { month: "Nisan",  day: 15, name: "Passover" },
//   { month: "Iyar",   day: 18, name: "Lag BaOmer" },
//   { month: "Sivan",  day: 6,  name: "Shavuot" },
// ];

// function getJewishFestivals(year: number): FestivalItem[] {
//   const results: FestivalItem[] = [];
//   const seen = new Set<string>();

//   const fmt = new Intl.DateTimeFormat("en-u-ca-hebrew", {
//     day: "numeric",
//     month: "long",
//   });

//   const start = new Date(year, 0, 1);
//   const end = new Date(year + 1, 1, 1);

//   for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
//     const parts = fmt.formatToParts(d);
//     const month = parts.find((p) => p.type === "month")?.value ?? "";
//     const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "0", 10);

//     for (const t of JEWISH_TARGETS) {
//       const matchesMonth =
//         t.month === month || (t.month === "Adar" && month.startsWith("Adar"));
//       if (matchesMonth && t.day === day) {
//         const key = `${format(d, "yyyy-MM-dd")}|${t.name}`;
//         if (seen.has(key)) continue;
//         seen.add(key);
//         results.push({
//           date: new Date(d),
//           dateString: format(d, "yyyy-MM-dd"),
//           name: t.name,
//           religion: "jewish",
//           source: "intl-hebrew",
//         });
//       }
//     }
//   }

//   return results.filter((r) => r.date.getFullYear() === year);
// }

// /* ------------------------------------------------------------------ */
// /*  Source 5 — Hindu Panchangam (panchanga)                            */
// /* ------------------------------------------------------------------ */

// interface PanchangaFestivalResult {
//   id?: string;
//   date?: string | Date;
// }

// /** Converts kebab-case festival id to Title Case. */
// function titleCase(id: string): string {
//   return id
//     .replace(/-/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase());
// }

// function getHinduFestivals(year: number, stateCode?: string): FestivalItem[] {
//   try {
//     const coords = getIndiaCoords(stateCode);
//     const location: GeoLocation = {
//       latitude: coords.lat,
//       longitude: coords.lng,
//       timeZone: coords.iana,
//     };

//     const result = computeFestivals(year, location, {
//       rules: allRules(year),
//     });

//     const list = (result as unknown as { results?: PanchangaFestivalResult[] })?.results ?? [];

//     return list
//       .filter((f) => f.date && f.id)
//       .map((f) => {
//         const d = typeof f.date === "string" ? new Date(f.date) : (f.date as Date);
//         return {
//           date: d,
//           dateString: format(d, "yyyy-MM-dd"),
//           name: titleCase(f.id!),
//           religion: "hindu" as const,
//           source: "panchanga" as const,
//         };
//       })
//       .filter((f) => f.date.getFullYear() === year);
//   } catch (error) {
//     console.error("panchanga error:", error);
//     return [];
//   }
// }

// /* ------------------------------------------------------------------ */
// /*  Aggregator                                                         */
// /* ------------------------------------------------------------------ */

// function dedupe(items: FestivalItem[]): FestivalItem[] {
//   const seen = new Set<string>();
//   const out: FestivalItem[] = [];
//   for (const f of items) {
//     const key = `${f.dateString}|${f.name.toLowerCase()}`;
//     if (seen.has(key)) continue;
//     seen.add(key);
//     out.push(f);
//   }
//   return out.sort((a, b) => a.date.getTime() - b.date.getTime());
// }

// /** Aggregates festivals from all sources for a country + year. */
// export function getAllFestivals(
//   countryCode: string,
//   year: number,
//   state?: string,
//   region?: string
// ): FestivalItem[] {
//   const sources: FestivalItem[] = [];

//   // date-holidays — always
//   sources.push(...getDateHolidays(countryCode, year, state, region));

//   // East Asian lunar
//   sources.push(...getEastAsianFestivals(year));

//   // Islamic + Jewish via Intl — always
//   sources.push(...getIslamicFestivals(year));
//   sources.push(...getJewishFestivals(year));

//   // Hindu panchanga — only for India
//   if (countryCode === "IN") {
//     sources.push(...getHinduFestivals(year, state));
//   }

//   return dedupe(sources);
// }

// /* ------------------------------------------------------------------ */
// /*  Options builders                                                   */
// /* ------------------------------------------------------------------ */

// export function getCountryOptions() {
//   try {
//     const countryMap = hd.getCountries("en");
//     return Object.entries(countryMap)
//       .map(([code, label]) => ({ value: code, label: label as string }))
//       .sort((a, b) => a.label.localeCompare(b.label));
//   } catch {
//     return [];
//   }
// }

// export function getStateOptions(countryCode: string) {
//   try {
//     const states = hd.getStates(countryCode, "en") ?? {};
//     return Object.entries(states)
//       .map(([value, label]) => ({ value, label: label as string }))
//       .sort((a, b) => a.label.localeCompare(b.label));
//   } catch {
//     return [];
//   }
// }

// src/features/calculators/festival-calendar/logic.ts
import Holidays from "date-holidays";
import { format } from "date-fns";
import { ChineseDate } from "chinese-lunar-date";
import { computeFestivals, allRules } from "panchanga";
import type { GeoLocation } from "panchanga";

const hd = new Holidays();

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Religion =
  | "christian" | "islamic" | "hindu" | "jewish"
  | "buddhist" | "east-asian" | "secular";

export interface FestivalItem {
  date: Date;
  dateString: string;
  name: string;
  religion: Religion;
  source: "date-holidays" | "chinese-lunar" | "intl-islamic" | "intl-hebrew" | "panchanga";
}

export interface ReligionMeta {
  label: string;
  dot: string;
  text: string;
  bg: string;
}

// export const RELIGION_META: Record<Religion, ReligionMeta> = {
//   christian:    { label: "Christian",       dot: "bg-sky-500",     text: "text-sky-700 dark:text-sky-300",         bg: "bg-sky-100 dark:bg-sky-500/20" },
//   islamic:      { label: "Islamic",         dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
//   hindu:        { label: "Hindu",           dot: "bg-orange-500",  text: "text-orange-700 dark:text-orange-300",   bg: "bg-orange-100 dark:bg-orange-500/20" },
//   jewish:       { label: "Jewish",          dot: "bg-violet-500",  text: "text-violet-700 dark:text-violet-300",   bg: "bg-violet-100 dark:bg-violet-500/20" },
//   buddhist:     { label: "Buddhist",        dot: "bg-amber-500",   text: "text-amber-700 dark:text-amber-300",     bg: "bg-amber-100 dark:bg-amber-500/20" },
//   "east-asian": { label: "East Asian",      dot: "bg-red-500",     text: "text-red-700 dark:text-red-300",         bg: "bg-red-100 dark:bg-red-500/20" },
//   secular:      { label: "Secular / Civic", dot: "bg-slate-400",   text: "text-slate-700 dark:text-slate-300",     bg: "bg-slate-100 dark:bg-slate-500/20" },
// };

// In src/features/calculators/festival-calendar/logic.ts

export const RELIGION_META: Record<Religion, ReligionMeta> = {
  christian:    { label: "Christian",       dot: "bg-sky-500",     text: "text-sky-700 dark:text-sky-300",         bg: "bg-sky-100 dark:bg-sky-500/20" },
  islamic:      { label: "Islamic",         dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
  hindu:        { label: "Hindu",           dot: "bg-orange-500",  text: "text-orange-700 dark:text-orange-300",   bg: "bg-orange-100 dark:bg-orange-500/20" },
  jewish:       { label: "Jewish",          dot: "bg-violet-500",  text: "text-violet-700 dark:text-violet-300",   bg: "bg-violet-100 dark:bg-violet-500/20" },
  buddhist:     { label: "Buddhist",        dot: "bg-amber-500",   text: "text-amber-700 dark:text-amber-300",     bg: "bg-amber-100 dark:bg-amber-500/20" },
  "east-asian": { label: "Chinese Lunar",   dot: "bg-red-500",     text: "text-red-700 dark:text-red-300",         bg: "bg-red-100 dark:bg-red-500/20" },
  secular:      { label: "Secular / Civic", dot: "bg-slate-400",   text: "text-slate-700 dark:text-slate-300",     bg: "bg-slate-100 dark:bg-slate-500/20" },
};

export const ALL_RELIGIONS: Religion[] = [
  "christian", "islamic", "hindu", "jewish", "buddhist", "east-asian", "secular",
];

export const MONTH_OPTIONS = [
  { value: "all", label: "All months" },
  { value: "0",  label: "January" },
  { value: "1",  label: "February" },
  { value: "2",  label: "March" },
  { value: "3",  label: "April" },
  { value: "4",  label: "May" },
  { value: "5",  label: "June" },
  { value: "6",  label: "July" },
  { value: "7",  label: "August" },
  { value: "8",  label: "September" },
  { value: "9",  label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
];

/* ------------------------------------------------------------------ */
/*  ⚡ Translation map for Chinese festival names                       */
/* ------------------------------------------------------------------ */

const CHINESE_TO_ENGLISH: Record<string, string> = {
  // Major festivals
  "春节": "Chinese New Year",
  "除夕": "Chinese New Year's Eve",
  "元宵节": "Lantern Festival",
  "上元节": "Lantern Festival",
  "清明节": "Qingming (Tomb-Sweeping Day)",
  "端午节": "Dragon Boat Festival",
  "七夕节": "Qixi Festival (Chinese Valentine's)",
  "中元节": "Ghost Festival",
  "中秋节": "Mid-Autumn Festival",
  "重阳节": "Double Ninth Festival",
  "腊八节": "Laba Festival",
  "小年": "Little New Year",
  "龙抬头": "Dragon Head-Raising Festival",
  "寒食节": "Cold Food Festival",
  "冬至": "Winter Solstice",
  "夏至": "Summer Solstice",
  "立春": "Start of Spring",
  "立夏": "Start of Summer",
  "立秋": "Start of Autumn",
  "立冬": "Start of Winter",
  // Solar terms (minor)
  "春分": "Spring Equinox",
  "秋分": "Autumn Equinox",
  "雨水": "Rain Water",
  "惊蛰": "Awakening of Insects",
  "谷雨": "Grain Rain",
  "小满": "Grain Full",
  "芒种": "Grain in Ear",
  "小暑": "Minor Heat",
  "大暑": "Major Heat",
  "处暑": "End of Heat",
  "白露": "White Dew",
  "寒露": "Cold Dew",
  "霜降": "Frost's Descent",
  "小雪": "Minor Snow",
  "大雪": "Major Snow",
  "小寒": "Minor Cold",
  "大寒": "Major Cold",
};

/** Translates a Chinese festival name to English, or returns the original. */
function translateEastAsian(name: string): string {
  // Direct hit
  if (CHINESE_TO_ENGLISH[name]) return CHINESE_TO_ENGLISH[name];

  // Partial match: name may include extra text like "春节 (Chinese New Year)"
  for (const [zh, en] of Object.entries(CHINESE_TO_ENGLISH)) {
    if (name.includes(zh)) {
      return name.replace(zh, en);
    }
  }

  // No translation — if it's pure CJK, return a generic label
  if (/[\u4e00-\u9fff]/.test(name)) {
    return "Traditional Festival";
  }

  return name;
}

/* ------------------------------------------------------------------ */
/*  ⚡ GLOBAL CACHES                                                   */
/* ------------------------------------------------------------------ */

const CACHE = {
  dateHolidays: new Map<string, FestivalItem[]>(),
  eastAsian: new Map<number, FestivalItem[]>(),
  islamic: new Map<number, FestivalItem[]>(),
  jewish: new Map<number, FestivalItem[]>(),
  hindu: new Map<string, FestivalItem[]>(),
};

/* ------------------------------------------------------------------ */
/*  Coordinates                                                        */
/* ------------------------------------------------------------------ */

const INDIA_COORDS: Record<string, { lat: number; lng: number; iana: string }> = {
  default: { lat: 28.6139, lng: 77.2090, iana: "Asia/Kolkata" },
  WB: { lat: 22.5726, lng: 88.3639, iana: "Asia/Kolkata" },
  MH: { lat: 19.0760, lng: 72.8777, iana: "Asia/Kolkata" },
  TN: { lat: 13.0827, lng: 80.2707, iana: "Asia/Kolkata" },
  KA: { lat: 12.9716, lng: 77.5946, iana: "Asia/Kolkata" },
  KL: { lat: 8.5241, lng: 76.9366, iana: "Asia/Kolkata" },
  UP: { lat: 26.8467, lng: 80.9462, iana: "Asia/Kolkata" },
  GJ: { lat: 23.0225, lng: 72.5714, iana: "Asia/Kolkata" },
  RJ: { lat: 26.9124, lng: 75.7873, iana: "Asia/Kolkata" },
  MP: { lat: 22.7196, lng: 75.8577, iana: "Asia/Kolkata" },
  AP: { lat: 17.3850, lng: 78.4867, iana: "Asia/Kolkata" },
  TS: { lat: 17.3850, lng: 78.4867, iana: "Asia/Kolkata" },
  BR: { lat: 25.5941, lng: 85.1376, iana: "Asia/Kolkata" },
  OR: { lat: 20.2961, lng: 85.8245, iana: "Asia/Kolkata" },
  AS: { lat: 26.1445, lng: 91.7362, iana: "Asia/Kolkata" },
  PB: { lat: 30.9010, lng: 75.8573, iana: "Asia/Kolkata" },
  HR: { lat: 29.0588, lng: 76.0856, iana: "Asia/Kolkata" },
  JH: { lat: 23.3441, lng: 85.3096, iana: "Asia/Kolkata" },
  CG: { lat: 21.2514, lng: 81.6296, iana: "Asia/Kolkata" },
  UK: { lat: 30.3165, lng: 78.0322, iana: "Asia/Kolkata" },
  HP: { lat: 31.1048, lng: 77.1734, iana: "Asia/Kolkata" },
  GA: { lat: 15.2993, lng: 74.1240, iana: "Asia/Kolkata" },
};

function getIndiaCoords(stateCode?: string) {
  return stateCode && INDIA_COORDS[stateCode] ? INDIA_COORDS[stateCode] : INDIA_COORDS.default;
}

/* ------------------------------------------------------------------ */
/*  Religion inference                                                 */
/* ------------------------------------------------------------------ */

const NAME_PATTERNS: { pattern: RegExp; religion: Religion }[] = [
  { pattern: /christmas|easter|good friday|ascension|pentecost|assumption|all saints|epiphany|corpus christi|advent|holy (thursday|saturday|week)|nativity|annunciation|candlemas|reformation day|christ the king|sacred heart|immaculate/i, religion: "christian" },
  { pattern: /ramadan|eid\b|eid al|muharram|ashura|mawlid|isra|mi'raj|arafah|hijri|laylat al-qadr|prophet'?s birthday|islamic new year/i, religion: "islamic" },
  { pattern: /diwali|deepavali|holi|navratri|dussehra|dasara|durga|kali puja|lakshmi|ganesh|pongal|onam|raksha bandhan|karva chauth|janmashtami|ram navami|maha shivaratri|shivaratri|vasant panchami|baisakhi|vaisakhi|gudi padwa|ugadi|thaipusam|thaipongal|makar sankranti|chhath|raja parba|nuakhai|bihu/i, religion: "hindu" },
  { pattern: /hanukkah|chanukah|passover|pesach|yom kippur|rosh hashana|purim|shavuot|sukkot|simchat torah|shmini atzeret|tisha b'av|lag ba'omer|tu bishvat/i, religion: "jewish" },
  { pattern: /vesak|vesakha|buddha|vassa|asarnha|magha puja|kathina|loy krathong|thingyan/i, religion: "buddhist" },
];

function inferReligion(name: string): Religion {
  for (const { pattern, religion } of NAME_PATTERNS) {
    if (pattern.test(name)) return religion;
  }
  return "secular";
}

/* ------------------------------------------------------------------ */
/*  Source 1 — date-holidays                                           */
/* ------------------------------------------------------------------ */

function computeDateHolidays(countryCode: string, year: number, state?: string, region?: string): FestivalItem[] {
  try {
    if (state && region) hd.init(countryCode, state, region);
    else if (state) hd.init(countryCode, state);
    else hd.init(countryCode);

    try { hd.setLanguages("en"); } catch { /* ignore */ }

    return hd.getHolidays(year).map((h) => {
      const d = new Date(h.date);
      return {
        date: d,
        dateString: format(d, "yyyy-MM-dd"),
        name: h.name,
        religion: inferReligion(h.name),
        source: "date-holidays" as const,
      };
    });
  } catch {
    return [];
  }
}

function getDateHolidays(countryCode: string, year: number, state?: string, region?: string): FestivalItem[] {
  const key = `${countryCode}|${state ?? ""}|${region ?? ""}|${year}`;
  let cached = CACHE.dateHolidays.get(key);
  if (!cached) {
    cached = computeDateHolidays(countryCode, year, state, region);
    CACHE.dateHolidays.set(key, cached);
  }
  return cached;
}

/* ------------------------------------------------------------------ */
/*  Source 2 — East Asian (with English translation)                   */
/* ------------------------------------------------------------------ */

function computeEastAsianFestivals(year: number): FestivalItem[] {
  const results: FestivalItem[] = [];
  const seen = new Set<string>();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    try {
      const lunar = ChineseDate.fromGregorian(d.getFullYear(), d.getMonth() + 1, d.getDate());
      const anyLunar = lunar as unknown as {
        getFestivals?: (loc: string) => Array<{ name?: string; festivalName?: string } | string>;
      };
      if (typeof anyLunar.getFestivals !== "function") continue;

      const list = anyLunar.getFestivals("zh-CN") || [];
      list.forEach((f) => {
        const rawName = typeof f === "string" ? f : f.name ?? f.festivalName ?? "Festival";
        const name = translateEastAsian(rawName);
        const key = `${format(d, "yyyy-MM-dd")}|${name}`;
        if (seen.has(key)) return;
        seen.add(key);
        results.push({
          date: new Date(d),
          dateString: format(d, "yyyy-MM-dd"),
          name,
          religion: "east-asian",
          source: "chinese-lunar",
        });
      });
    } catch { /* skip */ }
  }
  return results;
}

function getEastAsianFestivals(year: number): FestivalItem[] {
  let cached = CACHE.eastAsian.get(year);
  if (!cached) {
    cached = computeEastAsianFestivals(year);
    CACHE.eastAsian.set(year, cached);
  }
  return cached;
}

/* ------------------------------------------------------------------ */
/*  Source 3 — Islamic                                                 */
/* ------------------------------------------------------------------ */

const ISLAMIC_TARGETS = [
  { month: "Muharram",     day: 1,  name: "Islamic New Year" },
  { month: "Muharram",     day: 10, name: "Ashura" },
  { month: "Rabiʻ I",      day: 12, name: "Mawlid (Prophet's Birthday)" },
  { month: "Rajab",        day: 27, name: "Isra and Mi'raj" },
  { month: "Shaʻban",      day: 15, name: "Mid-Sha'ban" },
  { month: "Ramadan",      day: 1,  name: "Ramadan begins" },
  { month: "Ramadan",      day: 27, name: "Laylat al-Qadr" },
  { month: "Shawwal",      day: 1,  name: "Eid al-Fitr" },
  { month: "Dhuʻl-Hijjah", day: 9,  name: "Day of Arafah" },
  { month: "Dhuʻl-Hijjah", day: 10, name: "Eid al-Adha" },
];

function computeIslamicFestivals(year: number): FestivalItem[] {
  const results: FestivalItem[] = [];
  const seen = new Set<string>();
  const fmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "long" });
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 1, 1);

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const parts = fmt.formatToParts(d);
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "0", 10);

    for (const t of ISLAMIC_TARGETS) {
      if (t.month === month && t.day === day) {
        const key = `${format(d, "yyyy-MM-dd")}|${t.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push({
          date: new Date(d),
          dateString: format(d, "yyyy-MM-dd"),
          name: t.name,
          religion: "islamic",
          source: "intl-islamic",
        });
      }
    }
  }
  return results.filter((r) => r.date.getFullYear() === year);
}

function getIslamicFestivals(year: number): FestivalItem[] {
  let cached = CACHE.islamic.get(year);
  if (!cached) {
    cached = computeIslamicFestivals(year);
    CACHE.islamic.set(year, cached);
  }
  return cached;
}

/* ------------------------------------------------------------------ */
/*  Source 4 — Jewish                                                  */
/* ------------------------------------------------------------------ */

const JEWISH_TARGETS = [
  { month: "Tishri", day: 1,  name: "Rosh Hashanah" },
  { month: "Tishri", day: 10, name: "Yom Kippur" },
  { month: "Tishri", day: 15, name: "Sukkot" },
  { month: "Tishri", day: 22, name: "Shmini Atzeret" },
  { month: "Kislev", day: 25, name: "Hanukkah" },
  { month: "Shevat", day: 15, name: "Tu BiShvat" },
  { month: "Adar",   day: 14, name: "Purim" },
  { month: "Nisan",  day: 15, name: "Passover" },
  { month: "Iyar",   day: 18, name: "Lag BaOmer" },
  { month: "Sivan",  day: 6,  name: "Shavuot" },
];

function computeJewishFestivals(year: number): FestivalItem[] {
  const results: FestivalItem[] = [];
  const seen = new Set<string>();
  const fmt = new Intl.DateTimeFormat("en-u-ca-hebrew", { day: "numeric", month: "long" });
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 1, 1);

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const parts = fmt.formatToParts(d);
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "0", 10);

    for (const t of JEWISH_TARGETS) {
      const matches = t.month === month || (t.month === "Adar" && month.startsWith("Adar"));
      if (matches && t.day === day) {
        const key = `${format(d, "yyyy-MM-dd")}|${t.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push({
          date: new Date(d),
          dateString: format(d, "yyyy-MM-dd"),
          name: t.name,
          religion: "jewish",
          source: "intl-hebrew",
        });
      }
    }
  }
  return results.filter((r) => r.date.getFullYear() === year);
}

function getJewishFestivals(year: number): FestivalItem[] {
  let cached = CACHE.jewish.get(year);
  if (!cached) {
    cached = computeJewishFestivals(year);
    CACHE.jewish.set(year, cached);
  }
  return cached;
}

/* ------------------------------------------------------------------ */
/*  Source 5 — Hindu (panchanga)                                       */
/* ------------------------------------------------------------------ */

interface PanchangaResult { id?: string; date?: string | Date }

function titleCase(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function computeHinduFestivals(year: number, stateCode?: string): FestivalItem[] {
  try {
    const coords = getIndiaCoords(stateCode);
    const location: GeoLocation = {
      latitude: coords.lat,
      longitude: coords.lng,
      timeZone: coords.iana,
    };

    const result = computeFestivals(year, location, { rules: allRules(year) });
    const list = (result as unknown as { results?: PanchangaResult[] })?.results ?? [];

    return list
      .filter((f) => f.date && f.id)
      .map((f) => {
        const d = typeof f.date === "string" ? new Date(f.date) : (f.date as Date);
        return {
          date: d,
          dateString: format(d, "yyyy-MM-dd"),
          name: titleCase(f.id!),
          religion: "hindu" as const,
          source: "panchanga" as const,
        };
      })
      .filter((f) => f.date.getFullYear() === year);
  } catch (error) {
    console.error("panchanga error:", error);
    return [];
  }
}

function getHinduFestivals(year: number, stateCode?: string): FestivalItem[] {
  const key = `${stateCode ?? "default"}|${year}`;
  let cached = CACHE.hindu.get(key);
  if (!cached) {
    cached = computeHinduFestivals(year, stateCode);
    CACHE.hindu.set(key, cached);
  }
  return cached;
}

/* ------------------------------------------------------------------ */
/*  Dedupe                                                             */
/* ------------------------------------------------------------------ */

function dedupe(items: FestivalItem[]): FestivalItem[] {
  const seen = new Set<string>();
  const out: FestivalItem[] = [];
  for (const f of items) {
    const key = `${f.dateString}|${f.name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/* ------------------------------------------------------------------ */
/*  ⚡ Smart fetcher — only computes enabled categories                */
/* ------------------------------------------------------------------ */

export function getFestivalsForReligions(
  countryCode: string,
  year: number,
  enabledReligions: Set<Religion>,
  state?: string,
  region?: string
): FestivalItem[] {
  const results: FestivalItem[] = [];

  const needsDateHolidays =
    enabledReligions.has("christian") ||
    enabledReligions.has("secular") ||
    enabledReligions.has("buddhist") ||
    enabledReligions.has("islamic") ||
    enabledReligions.has("hindu") ||
    enabledReligions.has("jewish");

  if (needsDateHolidays) {
    const fromDateHolidays = getDateHolidays(countryCode, year, state, region);
    results.push(...fromDateHolidays.filter((f) => enabledReligions.has(f.religion)));
  }

  if (enabledReligions.has("east-asian")) {
    results.push(...getEastAsianFestivals(year));
  }
  if (enabledReligions.has("islamic")) {
    results.push(...getIslamicFestivals(year));
  }
  if (enabledReligions.has("jewish")) {
    results.push(...getJewishFestivals(year));
  }
  if (enabledReligions.has("hindu") && countryCode === "IN") {
    results.push(...getHinduFestivals(year, state));
  }

  return dedupe(results);
}

/* ------------------------------------------------------------------ */
/*  Options                                                            */
/* ------------------------------------------------------------------ */

export function getCountryOptions() {
  try {
    const countryMap = hd.getCountries("en");
    return Object.entries(countryMap)
      .map(([code, label]) => ({ value: code, label: label as string }))
      .sort((a, b) => a.label.localeCompare(b.label));
  } catch {
    return [];
  }
}

export function getStateOptions(countryCode: string) {
  try {
    const states = hd.getStates(countryCode, "en") ?? {};
    return Object.entries(states)
      .map(([value, label]) => ({ value, label: label as string }))
      .sort((a, b) => a.label.localeCompare(b.label));
  } catch {
    return [];
  }
}