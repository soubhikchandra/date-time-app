// // src/features/calculators/calendar/location-data.ts
// import type { LocaleCode } from "chinese-lunar-date";

// export type LunarSystem =
//   | { type: "chinese-lunar-date"; locale: LocaleCode }
//   | { type: "intl"; calendar: string };

// /** Maps country codes to their primary lunar calendar system. */
// export const LUNAR_SYSTEM_MAP: Record<string, LunarSystem> = {
//   // East Asian — uses chinese-lunar-date for both festivals and display
//   CN: { type: "chinese-lunar-date", locale: "zh-CN" },
//   TW: { type: "chinese-lunar-date", locale: "zh-TW" },
//   HK: { type: "chinese-lunar-date", locale: "zh-HK" },
//   JP: { type: "chinese-lunar-date", locale: "ja-JP" },
//   KR: { type: "chinese-lunar-date", locale: "ko-KR" },
//   VN: { type: "chinese-lunar-date", locale: "vi-VN" },

//   // Other lunar calendars — Intl is used for display only.
//   IL: { type: "intl", calendar: "hebrew" },
//   SA: { type: "intl", calendar: "islamic-civil" },
//   IR: { type: "intl", calendar: "persian" },
//   IN: { type: "intl", calendar: "indian" },
//   TH: { type: "intl", calendar: "buddhist" },
//   ET: { type: "intl", calendar: "ethiopic" },
// };
// // is this enough ? is this complete or i can add more?