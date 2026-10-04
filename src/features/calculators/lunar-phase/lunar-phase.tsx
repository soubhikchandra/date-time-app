// // src/features/calculators/lunar-phase/lunar-phase.tsx
// "use client";

// import { useMemo, useState, useSyncExternalStore } from "react";
// import { format, parseISO } from "date-fns";
// import {
//   Compass,
//   Moon,
//   Sparkles,
//   Sunrise,
//   Sunset,
//   Layers,
//   Eye,
// } from "lucide-react";
// import { ToolCardHeader } from "@/components/ui/tool-card-header";
// import { ResultPanel } from "@/components/ui/result-card";
// import { SearchableSelect } from "@/components/ui/searchable-select";
// import { cn } from "@/lib/utils";
// import {
//   detectLocalZone,
//   findCityForZone,
//   formatTimeInZone,
//   getBestViewingHint,
//   getCityOptions,
//   getCountryOptions,
//   getMoonInfo,
//   getMoonPositionInfo,
//   getMoonTimes,
//   getNextMoonEvents,
//   getStateOptions,
//   resolveCity,
// } from "./logic";

// const TOOL_SLUG = "lunar-phase";

// /* ------------------------------------------------------------------ */
// /*  Live tick                                                          */
// /* ------------------------------------------------------------------ */

// const TICK_MS = 60_000;
// function subscribeTick(cb: () => void) {
//   const id = window.setInterval(cb, TICK_MS);
//   return () => window.clearInterval(id);
// }
// const getTick = () => Math.floor(Date.now() / TICK_MS);
// const getServerTick = () => 0;

// /* ------------------------------------------------------------------ */
// /*  Moon glyph                                                         */
// /* ------------------------------------------------------------------ */

// function MoonGlyph({
//   fraction,
//   isWaxing,
// }: {
//   fraction: number;
//   isWaxing: boolean;
// }) {
//   const size = 96;
//   const r = size / 2;
//   const illum = fraction <= 0.5 ? fraction * 2 : (1 - fraction) * 2;

//   return (
//     <div className="relative grid place-items-center">
//       <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
//         <circle cx={r} cy={r} r={r - 2} fill="#1F2937" />
//         <circle
//           cx={r}
//           cy={r}
//           r={r - 2}
//           fill="#F3F4F6"
//           clipPath={`url(#clip-${isWaxing ? "wax" : "wan"})`}
//         />
//         <circle cx={r} cy={r} r={r - 2} fill="#1F2937" opacity={1 - illum} />
//         <defs>
//           <clipPath id="clip-wax">
//             <rect x={r} y={0} width={r} height={size} />
//           </clipPath>
//           <clipPath id="clip-wan">
//             <rect x={0} y={0} width={r} height={size} />
//           </clipPath>
//         </defs>
//       </svg>
//       <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
//         {Math.round(fraction * 100)}% lit
//       </span>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Compass view                                                       */
// /* ------------------------------------------------------------------ */

// function MoonCompass({
//   info,
//   moonrise,
//   referenceDate,
//   tz,
// }: {
//   info: ReturnType<typeof getMoonPositionInfo>;
//   moonrise: Date | null;
//   referenceDate: Date;
//   tz: string;
// }) {
//   const hint = getBestViewingHint(info, moonrise, referenceDate);

//   const SZ = 260;
//   const cx = SZ / 2;
//   const cy = SZ / 2;
//   const radius = 100;

//   const altClamped = Math.max(0, Math.min(90, info.altitude));
//   const r = radius * (1 - altClamped / 90);
//   const svgAngleRad = ((info.azimuth - 90) * Math.PI) / 180;
//   const mx = cx + r * Math.cos(svgAngleRad);
//   const my = cy + r * Math.sin(svgAngleRad);

//   const qualityColor = {
//     excellent:
//       "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
//     good: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
//     low: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
//     hidden: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
//   }[hint.quality];

//   const qualityLabel = {
//     excellent: "Excellent viewing",
//     good: "Good viewing",
//     low: "Low on horizon",
//     hidden: "Below horizon",
//   }[hint.quality];

//   return (
//     <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.55fr)]">
//       {/* Compass card */}
//       <div className="rounded-2xl border border-[var(--border-card)] bg-gradient-to-br from-slate-50 to-indigo-50 p-5 dark:border-indigo-500/20 dark:from-slate-900/40 dark:to-indigo-950/40">
//         <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">
//           <Compass size={12} />
//           Live moon position
//         </p>

//         <div className="flex justify-center">
//           <svg
//             viewBox={`0 0 ${SZ} ${SZ}`}
//             className="h-auto w-full max-w-[300px]"
//             role="img"
//             aria-label={`Moon at ${info.compass}, altitude ${Math.round(info.altitude)}°`}
//           >
//             <defs>
//               <radialGradient id="compass-bg" cx="50%" cy="50%" r="50%">
//                 <stop offset="0%" stopColor="rgba(99,84,232,0.06)" />
//                 <stop offset="100%" stopColor="rgba(99,84,232,0.12)" />
//               </radialGradient>
//             </defs>

//             <circle
//               cx={cx}
//               cy={cy}
//               r={radius + 10}
//               fill="url(#compass-bg)"
//               stroke="var(--border-card)"
//               strokeWidth={1}
//             />
//             <circle
//               cx={cx}
//               cy={cy}
//               r={radius}
//               fill="none"
//               stroke="var(--border-card)"
//               strokeWidth={1}
//               strokeDasharray="4 4"
//             />
//             <circle
//               cx={cx}
//               cy={cy}
//               r={radius * 0.5}
//               fill="none"
//               stroke="var(--border-card)"
//               strokeWidth={0.5}
//               strokeDasharray="2 3"
//             />

//             <line
//               x1={cx}
//               y1={cy - radius}
//               x2={cx}
//               y2={cy + radius}
//               stroke="var(--border-card)"
//               strokeWidth={0.5}
//             />
//             <line
//               x1={cx - radius}
//               y1={cy}
//               x2={cx + radius}
//               y2={cy}
//               stroke="var(--border-card)"
//               strokeWidth={0.5}
//             />

//             <text
//               x={cx}
//               y={cy - radius - 16}
//               textAnchor="middle"
//               fontSize="12"
//               fontWeight="700"
//               fill="var(--text-primary)"
//             >
//               N
//             </text>
//             <text
//               x={cx + radius + 16}
//               y={cy + 4}
//               textAnchor="middle"
//               fontSize="12"
//               fontWeight="700"
//               fill="var(--text-primary)"
//             >
//               E
//             </text>
//             <text
//               x={cx}
//               y={cy + radius + 20}
//               textAnchor="middle"
//               fontSize="12"
//               fontWeight="700"
//               fill="var(--text-primary)"
//             >
//               S
//             </text>
//             <text
//               x={cx - radius - 16}
//               y={cy + 4}
//               textAnchor="middle"
//               fontSize="12"
//               fontWeight="700"
//               fill="var(--text-primary)"
//             >
//               W
//             </text>

//             <line
//               x1={cx}
//               y1={cy}
//               x2={mx}
//               y2={my}
//               stroke="var(--purple)"
//               strokeWidth={1.5}
//               strokeDasharray="3 2"
//               opacity={0.7}
//             />

//             <circle cx={mx} cy={my} r={16} fill="#a78bfa" opacity={0.2} />
//             <circle cx={mx} cy={my} r={9} fill="#a78bfa" opacity={0.4} />

//             <circle
//               cx={mx}
//               cy={my}
//               r={5}
//               fill={info.isUp ? "#c4b5fd" : "#94a3b8"}
//               stroke="white"
//               strokeWidth={1.5}
//             />

//             <circle cx={cx} cy={cy} r={2} fill="var(--text-muted)" />
//             <text
//               x={cx + 6}
//               y={cy - 6}
//               fontSize="8"
//               fill="var(--text-muted)"
//               fontWeight="600"
//             >
//               zenith
//             </text>
//             <text
//               x={cx + radius - 4}
//               y={cy - 6}
//               fontSize="8"
//               textAnchor="end"
//               fill="var(--text-muted)"
//               fontWeight="600"
//             >
//               horizon
//             </text>
//           </svg>
//         </div>

//         <p className="mt-4 text-center text-[12px] text-muted-foreground">
//           Azimuth{" "}
//           <span className="font-mono font-bold text-[var(--text-primary)]">
//             {Math.round(info.azimuth)}°
//           </span>{" "}
//           · Altitude{" "}
//           <span className="font-mono font-bold text-[var(--text-primary)]">
//             {Math.round(info.altitude)}°
//           </span>
//         </p>
//       </div>

//       {/* Info panel */}
//       <div className="flex flex-col gap-3">
//         <div className={cn("rounded-xl p-3.5", qualityColor)}>
//           <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
//             <Eye size={12} />
//             {qualityLabel}
//           </p>
//           {hint.isVisibleNow ? (
//             <p className="mt-1.5 text-[13px] font-medium">
//               Moon is above the horizon in the{" "}
//               <span className="font-bold">{info.compass}</span> direction.
//             </p>
//           ) : hint.hoursUntilRise !== null ? (
//             <p className="mt-1.5 text-[13px] font-medium">
//               Rises in about{" "}
//               <span className="font-bold">
//                 {hint.hoursUntilRise.toFixed(1)}h
//               </span>{" "}
//               ({formatTimeInZone(moonrise, tz)}).
//             </p>
//           ) : (
//             <p className="mt-1.5 text-[13px] font-medium">
//               Moon is below the horizon.
//             </p>
//           )}
//         </div>

//         <div className="grid grid-cols-2 gap-2">
//           <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
//             <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
//               Direction
//             </p>
//             <p className="mt-1 text-[15px] font-bold text-[var(--text-primary)]">
//               {info.compass}
//             </p>
//             <p className="font-mono text-[10px] text-muted-foreground">
//               {Math.round(info.azimuth)}°
//             </p>
//           </div>
//           <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
//             <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
//               Altitude
//             </p>
//             <p className="mt-1 text-[15px] font-bold text-[var(--text-primary)]">
//               {Math.round(info.altitude)}°
//             </p>
//             <p className="font-mono text-[10px] text-muted-foreground">
//               above horizon
//             </p>
//           </div>
//           <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
//             <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
//               Distance
//             </p>
//             <p className="mt-1 text-[13px] font-bold text-[var(--text-primary)]">
//               {Math.round(info.distance).toLocaleString()} km
//             </p>
//             <p className="font-mono text-[10px] text-muted-foreground">
//               {info.distanceEarthRadii.toFixed(2)} Earth radii
//             </p>
//           </div>
//           <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
//             <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
//               Illumination
//             </p>
//             <p className="mt-1 text-[15px] font-bold text-[var(--text-primary)]">
//               {info.illuminationPct}%
//             </p>
//             <p className="font-mono text-[10px] text-muted-foreground">
//               {info.phaseName}
//             </p>
//           </div>
//         </div>

//         <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
//           <div className="flex items-center justify-between gap-2">
//             <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
//               Orbit position
//             </p>
//             <span className="text-[10px] text-muted-foreground">
//               {info.distanceNorm < 0.5 ? "closer" : "farther"}
//             </span>
//           </div>
//           <div className="mt-2 relative">
//             <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-btn-secondary)]">
//               <div
//                 className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500"
//                 style={{ width: `${info.distanceNorm * 100}%` }}
//               />
//             </div>
//             <div className="mt-1 flex justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
//               <span>Perigee</span>
//               <span>Apogee</span>
//             </div>
//           </div>
//         </div>

//         <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-3">
//           <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
//             Lit limb angle
//           </p>
//           <p className="mt-1 font-mono text-[12px] font-semibold text-[var(--text-primary)]">
//             {Math.round(info.parallacticAngle)}°
//           </p>
//           <p className="mt-0.5 text-[10px] text-muted-foreground">
//             Direction the bright side of the moon points
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Main                                                               */
// /* ------------------------------------------------------------------ */

// type Mode = "phase" | "compass";

// export function LunarPhase() {
//   const countryOptions = useMemo(() => getCountryOptions(), []);
//   const localZone = useMemo(() => detectLocalZone(), []);

//   const initial = useMemo(() => {
//     const hit = findCityForZone(localZone);
//     if (!hit) return { country: "US", state: "California", city: "" };
//     return { country: hit.countryIso2, state: hit.province, city: hit.cityKey };
//   }, [localZone]);

//   const [mode, setMode] = useState<Mode>("phase");
//   const [country, setCountry] = useState(initial.country);
//   const [state, setState] = useState(initial.state);
//   const [city, setCity] = useState(initial.city);
//   const [dateISO, setDateISO] = useState(format(new Date(), "yyyy-MM-dd"));

//   const stateOptions = useMemo(() => getStateOptions(country), [country]);
//   const cityOptions = useMemo(
//     () => (state ? getCityOptions(country, state) : []),
//     [country, state]
//   );

//   const handleCountry = (v: string) => {
//     setCountry(v);
//     const states = getStateOptions(v);
//     const nextState = states[0]?.value ?? "";
//     setState(nextState);
//     const cities = nextState ? getCityOptions(v, nextState) : [];
//     setCity(cities[0]?.value ?? "");
//   };

//   const handleState = (v: string) => {
//     setState(v);
//     const cities = getCityOptions(country, v);
//     setCity(cities[0]?.value ?? "");
//   };

//   const cityRecord = useMemo(() => (city ? resolveCity(city) : null), [city]);

//   const tick = useSyncExternalStore(subscribeTick, getTick, getServerTick);
//   const now = useMemo(
//     () => (tick === 0 ? null : new Date(tick * TICK_MS)),
//     [tick]
//   );

//   const selectedDate = useMemo(() => {
//     try {
//       const d = parseISO(dateISO);
//       d.setHours(12, 0, 0, 0);
//       return d;
//     } catch {
//       return new Date();
//     }
//   }, [dateISO]);

//   const moonInfo = useMemo(() => getMoonInfo(selectedDate), [selectedDate]);
//   const upcoming = useMemo(() => getNextMoonEvents(new Date(), 4), []);
//   const moonTimes = useMemo(() => {
//     if (!cityRecord) return null;
//     return getMoonTimes(selectedDate, cityRecord.lat, cityRecord.lng);
//   }, [selectedDate, cityRecord]);

//   const livePosition = useMemo(() => {
//     if (!cityRecord || !now) return null;
//     return getMoonPositionInfo(now, cityRecord.lat, cityRecord.lng);
//   }, [cityRecord, now]);

//   const tz = cityRecord?.timezone ?? "UTC";

//   return (
//     <div className="space-y-4">
//       <section className="tool-card rounded-3xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 sm:p-7">
//         <ToolCardHeader slug={TOOL_SLUG} />

//         {/* Mode toggle */}
//         <div className="mt-5 inline-flex rounded-xl bg-[var(--surface-btn-secondary)] p-1">
//           <button
//             type="button"
//             onClick={() => setMode("phase")}
//             className={cn(
//               "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold transition",
//               mode === "phase"
//                 ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm"
//                 : "text-muted-foreground hover:text-[var(--text-primary)]"
//             )}
//           >
//             <Moon size={13} />
//             Moon phase
//           </button>
//           <button
//             type="button"
//             onClick={() => setMode("compass")}
//             className={cn(
//               "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold transition",
//               mode === "compass"
//                 ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm"
//                 : "text-muted-foreground hover:text-[var(--text-primary)]"
//             )}
//           >
//             <Compass size={13} />
//             Moon compass
//           </button>
//         </div>

//         {/* Location picker */}
//         <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
//           <SearchableSelect
//             label="Country"
//             value={country}
//             onChange={handleCountry}
//             options={countryOptions}
//             placeholder="Country..."
//           />
//           <SearchableSelect
//             label="State / Province"
//             value={state}
//             onChange={handleState}
//             options={stateOptions}
//             placeholder={stateOptions.length === 0 ? "No states" : "State..."}
//             disabled={stateOptions.length === 0}
//           />
//           <SearchableSelect
//             label="City"
//             value={city}
//             onChange={setCity}
//             options={cityOptions}
//             placeholder={cityOptions.length === 0 ? "No cities" : "City..."}
//             disabled={cityOptions.length === 0}
//           />
//           <div className="grid gap-1.5">
//             <label className="text-[13px] font-semibold text-[var(--text-primary)]">
//               Date
//             </label>
//             <input
//               type="date"
//               value={dateISO}
//               onChange={(e) => setDateISO(e.target.value)}
//               disabled={mode === "compass"}
//               className="h-[42px] w-full rounded-[10px] border border-[var(--border-input)] bg-[var(--surface-input)] px-3.5 text-[15px] text-[var(--text-input)] outline-none disabled:opacity-50"
//               title={
//                 mode === "compass"
//                   ? "Moon compass always shows the live position for right now"
//                   : undefined
//               }
//             />
//           </div>
//         </div>

//         {mode === "compass" && (
//           <p className="mt-2 text-[11px] text-muted-foreground">
//             The Moon compass shows the live position — it always reflects
//             right now, regardless of the selected date.
//           </p>
//         )}

//         {/* PHASE MODE */}
//         {mode === "phase" && (
//           <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.5fr)]">
//             <div className="min-w-0 space-y-4">
//               <div className="rounded-2xl border border-[var(--border-card)] bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:from-indigo-500/10 dark:to-violet-500/5 dark:border-indigo-500/20">
//                 <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
//                   <MoonGlyph
//                     fraction={moonInfo.fraction}
//                     isWaxing={moonInfo.isWaxing}
//                   />
//                   <div className="min-w-0 flex-1 text-center sm:text-left">
//                     <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
//                       {moonInfo.isWaxing ? "Waxing" : "Waning"}
//                     </p>
//                     <p className="mt-1 text-[clamp(24px,6vw,36px)] font-bold leading-none tracking-[-.03em] text-[var(--text-primary)]">
//                       {moonInfo.name}
//                     </p>
//                     <p className="mt-2 text-[13px] text-muted-foreground">
//                       {moonInfo.illuminationPct}% illuminated
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {moonTimes && (
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
//                     <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
//                       <Sunrise size={14} />
//                       <span className="text-[10px] font-bold uppercase tracking-wider">
//                         Moonrise
//                       </span>
//                     </div>
//                     <p className="mt-2 font-mono text-[20px] font-bold text-[var(--text-primary)]">
//                       {formatTimeInZone(moonTimes.moonrise, tz)}
//                     </p>
//                   </div>

//                   <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
//                     <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
//                       <Sunset size={14} />
//                       <span className="text-[10px] font-bold uppercase tracking-wider">
//                         Moonset
//                       </span>
//                     </div>
//                     <p className="mt-2 font-mono text-[20px] font-bold text-[var(--text-primary)]">
//                       {formatTimeInZone(moonTimes.moonset, tz)}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
//                 <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
//                   Upcoming Phases
//                 </p>
//                 <ul className="space-y-1.5">
//                   {upcoming.length === 0 ? (
//                     <li className="text-[13px] text-muted-foreground">
//                       Computing…
//                     </li>
//                   ) : (
//                     upcoming.map((e) => (
//                       <li
//                         key={`${e.label}-${e.date.toISOString()}`}
//                         className="flex min-h-[40px] items-center gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] px-3 py-2"
//                       >
//                         <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--surface-card)] text-[var(--purple)]">
//                           <Moon size={12} />
//                         </span>
//                         <span className="shrink-0 text-[13px] font-semibold text-[var(--text-primary)]">
//                           {e.label}
//                         </span>
//                         <span className="min-w-0 flex-1 text-right font-mono text-[13px] font-medium text-[var(--text-primary)]">
//                           {format(e.date, "MMM d, h:mm a")}
//                         </span>
//                       </li>
//                     ))
//                   )}
//                 </ul>
//               </div>
//             </div>

//             <div className="lg:sticky lg:top-4 lg:self-start">
//               <ResultPanel title="Location">
//                 {cityRecord ? (
//                   <div className="space-y-4">
//                     <div>
//                       <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
//                         City
//                       </p>
//                       <p className="mt-1 text-[14px] font-bold text-[var(--text-primary)]">
//                         {cityRecord.city}
//                       </p>
//                       <p className="text-[12px] text-muted-foreground">
//                         {cityRecord.province?.trim() || cityRecord.country},{" "}
//                         {cityRecord.country}
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-2 gap-2">
//                       <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-2">
//                         <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
//                           Latitude
//                         </p>
//                         <p className="mt-0.5 font-mono text-[12px] font-semibold text-[var(--text-primary)]">
//                           {cityRecord.lat.toFixed(4)}
//                         </p>
//                       </div>
//                       <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-2">
//                         <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
//                           Longitude
//                         </p>
//                         <p className="mt-0.5 font-mono text-[12px] font-semibold text-[var(--text-primary)]">
//                           {cityRecord.lng.toFixed(4)}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-2">
//                       <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
//                         Timezone
//                       </p>
//                       <p className="mt-0.5 truncate font-mono text-[12px] font-semibold text-[var(--text-primary)]">
//                         {cityRecord.timezone}
//                       </p>
//                     </div>

//                     <div className="border-t border-[var(--border-card)] pt-3">
//                       <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
//                         <Sparkles size={11} className="text-[var(--purple)]" />
//                         Phase angle
//                       </div>
//                       <p className="mt-1 font-mono text-[12px] font-semibold text-[var(--text-primary)]">
//                         {((moonInfo.angle * 180) / Math.PI).toFixed(2)}°
//                       </p>
//                     </div>
//                   </div>
//                 ) : (
//                   <p className="text-[13px] text-muted-foreground">
//                     Select a location to see details.
//                   </p>
//                 )}
//               </ResultPanel>
//             </div>
//           </div>
//         )}

//         {/* COMPASS MODE */}
//         {mode === "compass" && (
//           <div className="mt-6">
//             {livePosition && cityRecord ? (
//               <MoonCompass
//                 info={livePosition}
//                 moonrise={moonTimes?.moonrise ?? null}
//                 referenceDate={now ?? new Date()}
//                 tz={tz}
//               />
//             ) : (
//               <div className="rounded-2xl border border-dashed border-[var(--border-card)] p-8 text-center">
//                 <Layers
//                   size={24}
//                   className="mx-auto mb-2 text-muted-foreground"
//                 />
//                 <p className="text-[13px] text-muted-foreground">
//                   Pick a country, state, and city to see the moon live
//                   position.
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }

// src/features/calculators/lunar-phase/lunar-phase.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { format, parseISO } from "date-fns";
import {
  Compass,
  Moon,
  Sparkles,
  Sunrise,
  Sunset,
  Layers,
  Eye,
} from "lucide-react";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { ResultPanel } from "@/components/ui/result-card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import {
  detectLocalZone,
  findCityForZone,
  formatTimeInZone,
  getBestViewingHint,
  getCityOptions,
  getCountryOptions,
  getMoonInfo,
  getMoonPositionInfo,
  getMoonTimes,
  getNextMoonEvents,
  getStateOptions,
  resolveCity,
} from "./logic";

const TOOL_SLUG = "lunar-phase";

/* ------------------------------------------------------------------ */
/*  Live tick                                                          */
/* ------------------------------------------------------------------ */

const TICK_MS = 60_000;
function subscribeTick(cb: () => void) {
  const id = window.setInterval(cb, TICK_MS);
  return () => window.clearInterval(id);
}
const getTick = () => Math.floor(Date.now() / TICK_MS);
const getServerTick = () => 0;

/* ------------------------------------------------------------------ */
/*  Moon glyph                                                         */
/* ------------------------------------------------------------------ */

function MoonGlyph({
  fraction,
  isWaxing,
}: {
  fraction: number;
  isWaxing: boolean;
}) {
  const size = 96;
  const r = size / 2;

  // ✅ FIX: never let NaN / Infinity reach an SVG attribute.
  const safeFraction = Number.isFinite(fraction)
    ? Math.min(1, Math.max(0, fraction))
    : 0;

  const illum =
    safeFraction <= 0.5 ? safeFraction * 2 : (1 - safeFraction) * 2;

  const shadowOpacity = Math.min(1, Math.max(0, 1 - illum));

  return (
    <div className="relative grid place-items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={r} cy={r} r={r - 2} fill="#1F2937" />
        <circle
          cx={r}
          cy={r}
          r={r - 2}
          fill="#F3F4F6"
          clipPath={`url(#clip-${isWaxing ? "wax" : "wan"})`}
        />
        <circle
          cx={r}
          cy={r}
          r={r - 2}
          fill="#1F2937"
          opacity={shadowOpacity}
        />
        <defs>
          <clipPath id="clip-wax">
            <rect x={r} y={0} width={r} height={size} />
          </clipPath>
          <clipPath id="clip-wan">
            <rect x={0} y={0} width={r} height={size} />
          </clipPath>
        </defs>
      </svg>
      <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {Math.round(safeFraction * 100)}% lit
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Compass view                                                       */
/* ------------------------------------------------------------------ */

function MoonCompass({
  info,
  moonrise,
  referenceDate,
  tz,
}: {
  info: ReturnType<typeof getMoonPositionInfo>;
  moonrise: Date | null;
  referenceDate: Date;
  tz: string;
}) {
  const hint = getBestViewingHint(info, moonrise, referenceDate);

  const SZ = 260;
  const cx = SZ / 2;
  const cy = SZ / 2;
  const radius = 100;

  // ✅ FIX: guard against non-finite values from bad input / bad dates.
  const safeAltitude = Number.isFinite(info.altitude) ? info.altitude : 0;
  const safeAzimuth = Number.isFinite(info.azimuth) ? info.azimuth : 0;

  const altClamped = Math.max(0, Math.min(90, safeAltitude));
  const r = radius * (1 - altClamped / 90);
  const svgAngleRad = ((safeAzimuth - 90) * Math.PI) / 180;
  const mx = cx + r * Math.cos(svgAngleRad);
  const my = cy + r * Math.sin(svgAngleRad);

  const qualityColor = {
    excellent:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    good: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    low: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
    hidden: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  }[hint.quality];

  const qualityLabel = {
    excellent: "Excellent viewing",
    good: "Good viewing",
    low: "Low on horizon",
    hidden: "Below horizon",
  }[hint.quality];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.55fr)]">
      {/* Compass card */}
      <div className="rounded-2xl border border-[var(--border-card)] bg-gradient-to-br from-slate-50 to-indigo-50 p-5 dark:border-indigo-500/20 dark:from-slate-900/40 dark:to-indigo-950/40">
        <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">
          <Compass size={12} />
          Live moon position
        </p>

        <div className="flex justify-center">
          <svg
            viewBox={`0 0 ${SZ} ${SZ}`}
            className="h-auto w-full max-w-[300px]"
            role="img"
            aria-label={`Moon at ${info.compass}, altitude ${Math.round(safeAltitude)}°`}
          >
            <defs>
              <radialGradient id="compass-bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(99,84,232,0.06)" />
                <stop offset="100%" stopColor="rgba(99,84,232,0.12)" />
              </radialGradient>
            </defs>

            <circle
              cx={cx}
              cy={cy}
              r={radius + 10}
              fill="url(#compass-bg)"
              stroke="var(--border-card)"
              strokeWidth={1}
            />
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="var(--border-card)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <circle
              cx={cx}
              cy={cy}
              r={radius * 0.5}
              fill="none"
              stroke="var(--border-card)"
              strokeWidth={0.5}
              strokeDasharray="2 3"
            />

            <line
              x1={cx}
              y1={cy - radius}
              x2={cx}
              y2={cy + radius}
              stroke="var(--border-card)"
              strokeWidth={0.5}
            />
            <line
              x1={cx - radius}
              y1={cy}
              x2={cx + radius}
              y2={cy}
              stroke="var(--border-card)"
              strokeWidth={0.5}
            />

            <text
              x={cx}
              y={cy - radius - 16}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="var(--text-primary)"
            >
              N
            </text>
            <text
              x={cx + radius + 16}
              y={cy + 4}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="var(--text-primary)"
            >
              E
            </text>
            <text
              x={cx}
              y={cy + radius + 20}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="var(--text-primary)"
            >
              S
            </text>
            <text
              x={cx - radius - 16}
              y={cy + 4}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="var(--text-primary)"
            >
              W
            </text>

            <line
              x1={cx}
              y1={cy}
              x2={mx}
              y2={my}
              stroke="var(--purple)"
              strokeWidth={1.5}
              strokeDasharray="3 2"
              opacity={0.7}
            />

            <circle cx={mx} cy={my} r={16} fill="#a78bfa" opacity={0.2} />
            <circle cx={mx} cy={my} r={9} fill="#a78bfa" opacity={0.4} />

            <circle
              cx={mx}
              cy={my}
              r={5}
              fill={info.isUp ? "#c4b5fd" : "#94a3b8"}
              stroke="white"
              strokeWidth={1.5}
            />

            <circle cx={cx} cy={cy} r={2} fill="var(--text-muted)" />
            <text
              x={cx + 6}
              y={cy - 6}
              fontSize="8"
              fill="var(--text-muted)"
              fontWeight="600"
            >
              zenith
            </text>
            <text
              x={cx + radius - 4}
              y={cy - 6}
              fontSize="8"
              textAnchor="end"
              fill="var(--text-muted)"
              fontWeight="600"
            >
              horizon
            </text>
          </svg>
        </div>

        <p className="mt-4 text-center text-[12px] text-muted-foreground">
          Azimuth{" "}
          <span className="font-mono font-bold text-[var(--text-primary)]">
            {Math.round(safeAzimuth)}°
          </span>{" "}
          · Altitude{" "}
          <span className="font-mono font-bold text-[var(--text-primary)]">
            {Math.round(safeAltitude)}°
          </span>
        </p>
      </div>

      {/* Info panel */}
      <div className="flex flex-col gap-3">
        <div className={cn("rounded-xl p-3.5", qualityColor)}>
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            <Eye size={12} />
            {qualityLabel}
          </p>
          {hint.isVisibleNow ? (
            <p className="mt-1.5 text-[13px] font-medium">
              Moon is above the horizon in the{" "}
              <span className="font-bold">{info.compass}</span> direction.
            </p>
          ) : hint.hoursUntilRise !== null ? (
            <p className="mt-1.5 text-[13px] font-medium">
              Rises in about{" "}
              <span className="font-bold">
                {hint.hoursUntilRise.toFixed(1)}h
              </span>{" "}
              ({formatTimeInZone(moonrise, tz)}).
            </p>
          ) : (
            <p className="mt-1.5 text-[13px] font-medium">
              Moon is below the horizon.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Direction
            </p>
            <p className="mt-1 text-[15px] font-bold text-[var(--text-primary)]">
              {info.compass}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {Math.round(safeAzimuth)}°
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Altitude
            </p>
            <p className="mt-1 text-[15px] font-bold text-[var(--text-primary)]">
              {Math.round(safeAltitude)}°
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              above horizon
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Distance
            </p>
            <p className="mt-1 text-[13px] font-bold text-[var(--text-primary)]">
              {Math.round(info.distance).toLocaleString()} km
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {info.distanceEarthRadii.toFixed(2)} Earth radii
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Illumination
            </p>
            <p className="mt-1 text-[15px] font-bold text-[var(--text-primary)]">
              {info.illuminationPct}%
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {info.phaseName}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Orbit position
            </p>
            <span className="text-[10px] text-muted-foreground">
              {info.distanceNorm < 0.5 ? "closer" : "farther"}
            </span>
          </div>
          <div className="mt-2 relative">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-btn-secondary)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500"
                style={{ width: `${info.distanceNorm * 100}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Perigee</span>
              <span>Apogee</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Lit limb angle
          </p>
          <p className="mt-1 font-mono text-[12px] font-semibold text-[var(--text-primary)]">
            {Math.round(info.parallacticAngle)}°
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Direction the bright side of the moon points
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

type Mode = "phase" | "compass";

export function LunarPhase() {
  const countryOptions = useMemo(() => getCountryOptions(), []);
  const localZone = useMemo(() => detectLocalZone(), []);

  const initial = useMemo(() => {
    const hit = findCityForZone(localZone);
    if (!hit) return { country: "US", state: "California", city: "" };
    return { country: hit.countryIso2, state: hit.province, city: hit.cityKey };
  }, [localZone]);

  const [mode, setMode] = useState<Mode>("phase");
  const [country, setCountry] = useState(initial.country);
  const [state, setState] = useState(initial.state);
  const [city, setCity] = useState(initial.city);
  const [dateISO, setDateISO] = useState(format(new Date(), "yyyy-MM-dd"));

  const stateOptions = useMemo(() => getStateOptions(country), [country]);
  const cityOptions = useMemo(
    () => (state ? getCityOptions(country, state) : []),
    [country, state]
  );

  const handleCountry = (v: string) => {
    setCountry(v);
    const states = getStateOptions(v);
    const nextState = states[0]?.value ?? "";
    setState(nextState);
    const cities = nextState ? getCityOptions(v, nextState) : [];
    setCity(cities[0]?.value ?? "");
  };

  const handleState = (v: string) => {
    setState(v);
    const cities = getCityOptions(country, v);
    setCity(cities[0]?.value ?? "");
  };

  const cityRecord = useMemo(() => (city ? resolveCity(city) : null), [city]);

  const tick = useSyncExternalStore(subscribeTick, getTick, getServerTick);
  const now = useMemo(
    () => (tick === 0 ? null : new Date(tick * TICK_MS)),
    [tick]
  );

  // ✅ FIX: parseISO does NOT throw on bad input — it returns an Invalid Date.
  // Guard against that (and against an empty string from the input).
  const selectedDate = useMemo(() => {
    const parsed = parseISO(dateISO);

    if (Number.isNaN(parsed.getTime())) {
      const fallback = new Date();
      fallback.setHours(12, 0, 0, 0);
      return fallback;
    }

    parsed.setHours(12, 0, 0, 0);
    return parsed;
  }, [dateISO]);

  const moonInfo = useMemo(() => getMoonInfo(selectedDate), [selectedDate]);
  const upcoming = useMemo(() => getNextMoonEvents(new Date(), 4), []);
  const moonTimes = useMemo(() => {
    if (!cityRecord) return null;
    return getMoonTimes(selectedDate, cityRecord.lat, cityRecord.lng);
  }, [selectedDate, cityRecord]);

  const livePosition = useMemo(() => {
    if (!cityRecord || !now) return null;
    return getMoonPositionInfo(now, cityRecord.lat, cityRecord.lng);
  }, [cityRecord, now]);

  const tz = cityRecord?.timezone ?? "UTC";

  return (
    <div className="space-y-4">
      <section className="tool-card rounded-3xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 sm:p-7">
        <ToolCardHeader slug={TOOL_SLUG} />

        {/* Mode toggle */}
        <div className="mt-5 inline-flex rounded-xl bg-[var(--surface-btn-secondary)] p-1">
          <button
            type="button"
            onClick={() => setMode("phase")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold transition",
              mode === "phase"
                ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm"
                : "text-muted-foreground hover:text-[var(--text-primary)]"
            )}
          >
            <Moon size={13} />
            Moon phase
          </button>
          <button
            type="button"
            onClick={() => setMode("compass")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold transition",
              mode === "compass"
                ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm"
                : "text-muted-foreground hover:text-[var(--text-primary)]"
            )}
          >
            <Compass size={13} />
            Moon compass
          </button>
        </div>

        {/* Location picker */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SearchableSelect
            label="Country"
            value={country}
            onChange={handleCountry}
            options={countryOptions}
            placeholder="Country..."
          />
          <SearchableSelect
            label="State / Province"
            value={state}
            onChange={handleState}
            options={stateOptions}
            placeholder={stateOptions.length === 0 ? "No states" : "State..."}
            disabled={stateOptions.length === 0}
          />
          <SearchableSelect
            label="City"
            value={city}
            onChange={setCity}
            options={cityOptions}
            placeholder={cityOptions.length === 0 ? "No cities" : "City..."}
            disabled={cityOptions.length === 0}
          />
          <div className="grid gap-1.5">
            <label className="text-[13px] font-semibold text-[var(--text-primary)]">
              Date
            </label>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              disabled={mode === "compass"}
              className="h-[42px] w-full rounded-[10px] border border-[var(--border-input)] bg-[var(--surface-input)] px-3.5 text-[15px] text-[var(--text-input)] outline-none disabled:opacity-50"
              title={
                mode === "compass"
                  ? "Moon compass always shows the live position for right now"
                  : undefined
              }
            />
          </div>
        </div>

        {mode === "compass" && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            The Moon compass shows the live position — it always reflects
            right now, regardless of the selected date.
          </p>
        )}

        {/* PHASE MODE */}
        {mode === "phase" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.5fr)]">
            <div className="min-w-0 space-y-4">
              <div className="rounded-2xl border border-[var(--border-card)] bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:from-indigo-500/10 dark:to-violet-500/5 dark:border-indigo-500/20">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <MoonGlyph
                    fraction={moonInfo.fraction}
                    isWaxing={moonInfo.isWaxing}
                  />
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {moonInfo.isWaxing ? "Waxing" : "Waning"}
                    </p>
                    <p className="mt-1 text-[clamp(24px,6vw,36px)] font-bold leading-none tracking-[-.03em] text-[var(--text-primary)]">
                      {moonInfo.name}
                    </p>
                    <p className="mt-2 text-[13px] text-muted-foreground">
                      {moonInfo.illuminationPct}% illuminated
                    </p>
                  </div>
                </div>
              </div>

              {moonTimes && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <Sunrise size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Moonrise
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-[20px] font-bold text-[var(--text-primary)]">
                      {formatTimeInZone(moonTimes.moonrise, tz)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
                    <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                      <Sunset size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Moonset
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-[20px] font-bold text-[var(--text-primary)]">
                      {formatTimeInZone(moonTimes.moonset, tz)}
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Upcoming Phases
                </p>
                <ul className="space-y-1.5">
                  {upcoming.length === 0 ? (
                    <li className="text-[13px] text-muted-foreground">
                      Computing…
                    </li>
                  ) : (
                    upcoming.map((e) => (
                      <li
                        key={`${e.label}-${e.date.toISOString()}`}
                        className="flex min-h-[40px] items-center gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] px-3 py-2"
                      >
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--surface-card)] text-[var(--purple)]">
                          <Moon size={12} />
                        </span>
                        <span className="shrink-0 text-[13px] font-semibold text-[var(--text-primary)]">
                          {e.label}
                        </span>
                        <span className="min-w-0 flex-1 text-right font-mono text-[13px] font-medium text-[var(--text-primary)]">
                          {format(e.date, "MMM d, h:mm a")}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="lg:sticky lg:top-4 lg:self-start">
              <ResultPanel title="Location">
                {cityRecord ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        City
                      </p>
                      <p className="mt-1 text-[14px] font-bold text-[var(--text-primary)]">
                        {cityRecord.city}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {cityRecord.province?.trim() || cityRecord.country},{" "}
                        {cityRecord.country}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-2">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          Latitude
                        </p>
                        <p className="mt-0.5 font-mono text-[12px] font-semibold text-[var(--text-primary)]">
                          {cityRecord.lat.toFixed(4)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-2">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          Longitude
                        </p>
                        <p className="mt-0.5 font-mono text-[12px] font-semibold text-[var(--text-primary)]">
                          {cityRecord.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        Timezone
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[12px] font-semibold text-[var(--text-primary)]">
                        {cityRecord.timezone}
                      </p>
                    </div>

                    <div className="border-t border-[var(--border-card)] pt-3">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <Sparkles size={11} className="text-[var(--purple)]" />
                        Phase angle
                      </div>
                      <p className="mt-1 font-mono text-[12px] font-semibold text-[var(--text-primary)]">
                        {((moonInfo.angle * 180) / Math.PI).toFixed(2)}°
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] text-muted-foreground">
                    Select a location to see details.
                  </p>
                )}
              </ResultPanel>
            </div>
          </div>
        )}

        {/* COMPASS MODE */}
        {mode === "compass" && (
          <div className="mt-6">
            {livePosition && cityRecord ? (
              <MoonCompass
                info={livePosition}
                moonrise={moonTimes?.moonrise ?? null}
                referenceDate={now ?? new Date()}
                tz={tz}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border-card)] p-8 text-center">
                <Layers
                  size={24}
                  className="mx-auto mb-2 text-muted-foreground"
                />
                <p className="text-[13px] text-muted-foreground">
                  Pick a country, state, and city to see the moon live
                  position.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}