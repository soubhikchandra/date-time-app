// // -------------------------------------------------------------------
// // src/features/calculators/timezone-difference/timezone-difference.tsx
// "use client";

// import { useMemo, useState, useSyncExternalStore } from "react";
// import {
//   ArrowLeftRight,
//   ArrowUpDown,
//   BarChart3,
//   Check,
//   Copy,
//   Clock3,
//   Download,
//   FileSpreadsheet,
//   Layers,
//   Moon,
//   Phone,
//   Plus,
//   Sun,
//   Trash2,
//   X,
// } from "lucide-react";
// import { ToolCardHeader } from "@/components/ui/tool-card-header";
// import { SearchableSelect } from "@/components/ui/searchable-select";
// import { cn } from "@/lib/utils";
// import {
//   buildMultiCityIcs,
//   detectLocalZone,
//   findLocationForZone,
//   formatHourRanges,
//   getBestCallWindow,
//   getCountryOptions,
//   getHeatmap,
//   getMultiCityComparison,
//   getStateOptions,
//   getZoneDifference,
//   getZoneInfo,
//   makeCityId,
//   makeCityLabel,
//   resolveTimezone,
//   seedCities,
//   sortRows,
//   toMultiCityCsv,
//   type MultiCityEntry,
//   type MultiCityRow,
//   type Option,
//   type SortMode,
// } from "./logic";

// const TOOL_SLUG = "timezone-difference";
// const MAX_CITIES = 8;

// /* ------------------------------------------------------------------ */
// /*  Copy button                                                        */
// /* ------------------------------------------------------------------ */

// function CopyButton({
//   value,
//   label = "Copy",
// }: {
//   value: string;
//   label?: string;
// }) {
//   const [copied, setCopied] = useState(false);
//   const copy = async () => {
//     try {
//       await navigator.clipboard.writeText(value);
//       setCopied(true);
//       window.setTimeout(() => setCopied(false), 1400);
//     } catch {
//       /* clipboard blocked */
//     }
//   };
//   return (
//     <button
//       type="button"
//       className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--surface-card)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface-btn-secondary)]"
//       onClick={copy}
//     >
//       {copied ? <Check size={12} /> : <Copy size={12} />}
//       {copied ? "Copied" : label}
//     </button>
//   );
// }

// function FileButton({
//   content,
//   filename,
//   mimeType,
//   label,
//   icon,
// }: {
//   content: string;
//   filename: string;
//   mimeType: string;
//   label: string;
//   icon: React.ReactNode;
// }) {
//   const download = () => {
//     const blob = new Blob([content], { type: mimeType });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };
//   return (
//     <button
//       type="button"
//       onClick={download}
//       className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--surface-card)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface-btn-secondary)]"
//     >
//       {icon}
//       {label}
//     </button>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Live tick                                                          */
// /* ------------------------------------------------------------------ */

// const TICK_MS = 1000;
// function subscribeTick(cb: () => void) {
//   const id = window.setInterval(cb, TICK_MS);
//   return () => window.clearInterval(id);
// }
// const getTick = () => Math.floor(Date.now() / TICK_MS);
// const getServerTick = () => 0;

// /* ------------------------------------------------------------------ */
// /*  Mode tab                                                           */
// /* ------------------------------------------------------------------ */

// function ModeTab({
//   active,
//   onClick,
//   children,
// }: {
//   active: boolean;
//   onClick: () => void;
//   children: React.ReactNode;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={
//         "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition " +
//         (active
//           ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm"
//           : "text-muted-foreground hover:text-[var(--text-primary)]")
//       }
//     >
//       {children}
//     </button>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Location picker                                                    */
// /* ------------------------------------------------------------------ */

// function LocationPicker({
//   country,
//   state,
//   onCountryChange,
//   onStateChange,
//   countryOptions,
//   stateOptions,
// }: {
//   country: string;
//   state: string;
//   onCountryChange: (v: string) => void;
//   onStateChange: (v: string) => void;
//   countryOptions: Option[];
//   stateOptions: Option[];
// }) {
//   return (
//     <div className="grid gap-2 sm:grid-cols-2">
//       <SearchableSelect
//         value={country}
//         onChange={onCountryChange}
//         options={countryOptions}
//         placeholder="Country..."
//       />
//       <SearchableSelect
//         value={state}
//         onChange={onStateChange}
//         options={stateOptions}
//         placeholder={stateOptions.length === 0 ? "No states" : "State..."}
//         disabled={stateOptions.length === 0}
//       />
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  City row (with business-hours badge)                               */
// /* ------------------------------------------------------------------ */

// function CityRow({
//   row,
//   onRemove,
// }: {
//   row: MultiCityRow;
//   onRemove: () => void;
// }) {
//   const isAhead = row.diffMinutes > 0;
//   const isBehind = row.diffMinutes < 0;

//   return (
//     <li
//       className={cn(
//         "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-3 py-3 transition sm:px-4",
//         row.inBusinessHours
//           ? "border-emerald-400/50 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-500/5"
//           : "border-[var(--border-card)] bg-[var(--surface-card)]",
//       )}
//     >
//       {/* Day/night icon */}
//       <span
//         className={cn(
//           "grid size-9 shrink-0 place-items-center rounded-xl",
//           row.info.isDaytime
//             ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
//             : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
//         )}
//       >
//         {row.info.isDaytime ? <Sun size={15} /> : <Moon size={15} />}
//       </span>

//       {/* Label */}
//       <div className="min-w-0 flex-1">
//         <p className="truncate text-[13px] font-bold text-[var(--text-primary)]">
//           {row.label}
//         </p>
//         <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
//           {row.info.abbreviation} · {row.info.offsetLabel}
//         </p>
//       </div>

//       {/* Business hours badge */}
//       <span
//         className={cn(
//           "hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline-flex",
//           row.inBusinessHours
//             ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
//             : row.inAwakeHours
//               ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
//               : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
//         )}
//         title={
//           row.inBusinessHours
//             ? "In business hours (9 AM – 6 PM)"
//             : row.inAwakeHours
//               ? "Awake hours (6 AM – 10 PM)"
//               : "Sleep hours"
//         }
//       >
//         {row.inBusinessHours
//           ? "☎ Call now"
//           : row.inAwakeHours
//             ? "Awake"
//             : "Asleep"}
//       </span>

//       {/* Time + diff */}
//       <div className="flex shrink-0 items-center gap-3">
//         <div className="text-right">
//           <p className="font-mono text-[clamp(14px,3.5vw,16px)] font-bold text-[var(--text-primary)]">
//             {row.info.currentTime}
//           </p>
//           <div className="mt-0.5 flex items-center justify-end gap-1.5">
//             {row.isSameAsReference ? (
//               <span className="text-[10px] font-bold text-muted-foreground">
//                 Same as reference
//               </span>
//             ) : (
//               <>
//                 <span
//                   className={cn(
//                     "font-mono text-[11px] font-bold",
//                     isAhead
//                       ? "text-emerald-600 dark:text-emerald-400"
//                       : isBehind
//                         ? "text-orange-600 dark:text-orange-400"
//                         : "text-muted-foreground",
//                   )}
//                 >
//                   {row.diffLabel}
//                 </span>
//                 {row.dayShift !== 0 && (
//                   <span className="rounded-full bg-[var(--surface-btn-secondary)] px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
//                     {row.dayShift > 0 ? "+" : "−"}
//                     {Math.abs(row.dayShift)}d
//                   </span>
//                 )}
//               </>
//             )}
//           </div>
//         </div>

//         <button
//           type="button"
//           onClick={onRemove}
//           aria-label={`Remove ${row.label}`}
//           className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-[var(--surface-btn-secondary)] hover:text-rose-500"
//         >
//           <Trash2 size={13} />
//         </button>
//       </div>
//     </li>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Heatmap                                                            */
// /* ------------------------------------------------------------------ */

// function HeatmapView({
//   heatmap,
//   referenceLabel,
// }: {
//   heatmap: ReturnType<typeof getHeatmap>;
//   referenceLabel: string;
// }) {
//   return (
//     <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
//       <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
//         <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
//           <BarChart3 size={12} />
//           24-hour heatmap · {referenceLabel} time
//         </p>
//         <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
//           <span className="inline-flex items-center gap-1.5">
//             <span className="size-2.5 rounded-sm bg-emerald-500" />
//             Business (9–18)
//           </span>
//           <span className="inline-flex items-center gap-1.5">
//             <span className="size-2.5 rounded-sm bg-amber-400/70" />
//             Awake (6–22)
//           </span>
//           <span className="inline-flex items-center gap-1.5">
//             <span className="size-2.5 rounded-sm bg-slate-300 dark:bg-slate-700" />
//             Sleep
//           </span>
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <div className="min-w-[640px]">
//           {/* Hour header */}
//           <div className="flex items-center">
//             <div className="w-32 shrink-0" />
//             <div className="flex flex-1 gap-0.5">
//               {heatmap.hours.map((h) => (
//                 <div
//                   key={h}
//                   className={cn(
//                     "flex-1 text-center text-[9px] font-bold",
//                     h === heatmap.currentHour
//                       ? "text-[var(--purple)]"
//                       : "text-muted-foreground",
//                   )}
//                 >
//                   {String(h).padStart(2, "0")}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Rows */}
//           {heatmap.rows.map((r) => (
//             <div key={r.id} className="mt-1 flex items-center">
//               <div className="w-32 shrink-0 truncate pr-2 text-[11px] font-semibold text-[var(--text-primary)]">
//                 {r.label}
//               </div>
//               <div className="flex flex-1 gap-0.5">
//                 {r.cells.map((level, h) => (
//                   <div
//                     key={h}
//                     className={cn(
//                       "h-6 flex-1 rounded-sm transition",
//                       level === "business" && "bg-emerald-500",
//                       level === "awake" && "bg-amber-400/70",
//                       level === "sleep" && "bg-slate-300 dark:bg-slate-700",
//                       h === heatmap.currentHour &&
//                         "ring-2 ring-[var(--purple)] ring-offset-1 ring-offset-[var(--surface-card)]",
//                     )}
//                     title={`${r.label} at ${String(h).padStart(2, "0")}:00 reference = ${
//                       level === "business"
//                         ? "business hours"
//                         : level === "awake"
//                           ? "awake"
//                           : "asleep"
//                     }`}
//                   />
//                 ))}
//               </div>
//             </div>
//           ))}

//           {/* Business-hours-per-hour bar chart */}
//           <div className="mt-3 flex items-center">
//             <div className="w-32 shrink-0 pr-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
//               In business
//             </div>
//             <div className="flex flex-1 gap-0.5">
//               {heatmap.businessPerHour.map((count, h) => {
//                 const max = heatmap.rows.length || 1;
//                 const pct = (count / max) * 100;
//                 return (
//                   <div
//                     key={h}
//                     className="flex h-8 flex-1 items-end overflow-hidden rounded-sm bg-[var(--surface-btn-secondary)]"
//                     title={`${count} of ${max} cities in business hours`}
//                   >
//                     <div
//                       className={cn(
//                         "w-full rounded-sm transition-[height]",
//                         count === max && max > 0
//                           ? "bg-emerald-500"
//                           : "bg-emerald-500/40",
//                       )}
//                       style={{ height: `${pct}%` }}
//                     />
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Main                                                               */
// /* ------------------------------------------------------------------ */

// export function TimezoneDifference() {
//   const countryOptions = useMemo(() => getCountryOptions(), []);
//   const localZone = useMemo(() => detectLocalZone(), []);

//   const initial = useMemo(() => {
//     const hit = findLocationForZone(localZone);
//     if (!hit) return { country: "US", state: "" };
//     return { country: hit.countryIso2, state: hit.state };
//   }, [localZone]);

//   const [mode, setMode] = useState<"two" | "multi">("two");

//   /* -------- Two-city state -------- */
//   const [fromCountry, setFromCountry] = useState(initial.country);
//   const [fromState, setFromState] = useState(initial.state);
//   const [toCountry, setToCountry] = useState("JP");
//   const [toState, setToState] = useState("Tokyo");

//   /* -------- Multi-city state -------- */
//   const [refCountry, setRefCountry] = useState(initial.country);
//   const [refState, setRefState] = useState(initial.state);
//   const [cities, setCities] = useState<MultiCityEntry[]>(() =>
//     seedCities(localZone),
//   );
//   const [sortMode, setSortMode] = useState<SortMode>("added");
//   const [showHeatmap, setShowHeatmap] = useState(true);
//   const [adding, setAdding] = useState(false);
//   const [newCountry, setNewCountry] = useState("JP");
//   const [newState, setNewState] = useState(() => {
//     const s = getStateOptions("JP");
//     return s[0]?.value ?? "";
//   });

//   /* -------- Live tick -------- */
//   const tick = useSyncExternalStore(subscribeTick, getTick, getServerTick);
//   const now = useMemo(
//     () => (tick === 0 ? null : new Date(tick * TICK_MS)),
//     [tick],
//   );

//   /* -------- Two-city computed -------- */
//   const fromStateOptions = useMemo(
//     () => getStateOptions(fromCountry),
//     [fromCountry],
//   );
//   const toStateOptions = useMemo(() => getStateOptions(toCountry), [toCountry]);
//   const fromZone = fromState ? resolveTimezone(fromCountry, fromState) : null;
//   const toZone = toState ? resolveTimezone(toCountry, toState) : null;
//   const diff = useMemo(() => {
//     if (!now || !fromZone || !toZone) return null;
//     return getZoneDifference(fromZone, toZone, now);
//   }, [fromZone, toZone, now]);

//   /* -------- Multi-city computed -------- */
//   const refStateOptions = useMemo(
//     () => getStateOptions(refCountry),
//     [refCountry],
//   );
//   const newStateOptions = useMemo(
//     () => getStateOptions(newCountry),
//     [newCountry],
//   );
//   const refZone = refState ? resolveTimezone(refCountry, refState) : null;
//   const refInfo = useMemo(() => {
//     if (!now || !refZone) return null;
//     return getZoneInfo(refZone, now);
//   }, [now, refZone]);

//   const rawRows = useMemo(() => {
//     if (!now || !refZone) return [];
//     return getMultiCityComparison(refZone, cities, now);
//   }, [now, refZone, cities]);

//   const sortedRows = useMemo(
//     () => sortRows(rawRows, sortMode),
//     [rawRows, sortMode],
//   );

//   const heatmap = useMemo(() => {
//     if (!now || !refZone) return null;
//     return getHeatmap(refZone, cities, now);
//   }, [now, refZone, cities]);

//   const bestWindow = useMemo(() => {
//     if (!now || !refZone) return null;
//     return getBestCallWindow(refZone, cities, now);
//   }, [now, refZone, cities]);

//   const refLabel = makeCityLabel(refCountry, refState);

//   const canAddCity = useMemo(() => {
//     if (!newState) return false;
//     if (cities.length >= MAX_CITIES) return false;
//     const zone = resolveTimezone(newCountry, newState);
//     if (!zone) return false;
//     if (refZone && zone === refZone) return false;
//     if (cities.some((c) => c.zone === zone)) return false;
//     return true;
//   }, [newCountry, newState, refZone, cities]);

//   /* -------- Handlers -------- */
//   const handleFromCountry = (v: string) => {
//     setFromCountry(v);
//     setFromState(getStateOptions(v)[0]?.value ?? "");
//   };
//   const handleToCountry = (v: string) => {
//     setToCountry(v);
//     setToState(getStateOptions(v)[0]?.value ?? "");
//   };
//   const swap = () => {
//     setFromCountry(toCountry);
//     setFromState(toState);
//     setToCountry(fromCountry);
//     setToState(fromState);
//   };

//   const handleRefCountry = (v: string) => {
//     setRefCountry(v);
//     setRefState(getStateOptions(v)[0]?.value ?? "");
//   };
//   const handleNewCountry = (v: string) => {
//     setNewCountry(v);
//     setNewState(getStateOptions(v)[0]?.value ?? "");
//   };

//   const handleAddCity = () => {
//     if (!canAddCity) return;
//     const zone = resolveTimezone(newCountry, newState);
//     if (!zone) return;
//     setCities((prev) => [
//       ...prev,
//       { id: makeCityId(), countryIso2: newCountry, state: newState, zone },
//     ]);
//     setAdding(false);
//   };

//   const handleRemoveCity = (id: string) =>
//     setCities((prev) => prev.filter((c) => c.id !== id));

//   /* -------- Export content -------- */
//   const copyAllText = useMemo(() => {
//     if (!refInfo || !refZone) return "";
//     const lines = [
//       `Reference: ${refLabel} — ${refInfo.currentTime} ${refInfo.abbreviation}`,
//     ];
//     sortedRows.forEach((r) => {
//       const suffix = r.isSameAsReference
//         ? "same as reference"
//         : `${r.diffLabel}${
//             r.dayShift !== 0
//               ? `, ${r.dayShift > 0 ? "+" : "−"}${Math.abs(r.dayShift)}d`
//               : ""
//           }`;
//       lines.push(
//         `${r.label} — ${r.info.currentTime} ${r.info.abbreviation} (${suffix})`,
//       );
//     });
//     return lines.join("\n");
//   }, [refInfo, refZone, refLabel, sortedRows]);

//   const csvContent = useMemo(
//     () => toMultiCityCsv(refLabel, sortedRows),
//     [refLabel, sortedRows],
//   );

//   const icsContent = useMemo(() => {
//     if (!now) return "";
//     return buildMultiCityIcs(refLabel, sortedRows, now);
//   }, [refLabel, sortedRows, now]);

//   const todayStamp = useMemo(() => {
//     const d = now ?? new Date();
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
//       d.getDate(),
//     ).padStart(2, "0")}`;
//   }, [now]);

//   return (
//     <div className="space-y-4">
//       <section className="tool-card rounded-3xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 sm:p-7">
//         <ToolCardHeader slug={TOOL_SLUG} />

//         {/* Mode toggle */}
//         <div className="mt-5 inline-flex rounded-xl bg-[var(--surface-btn-secondary)] p-1">
//           <ModeTab active={mode === "two"} onClick={() => setMode("two")}>
//             <ArrowLeftRight size={13} />
//             Two cities
//           </ModeTab>
//           <ModeTab active={mode === "multi"} onClick={() => setMode("multi")}>
//             <Layers size={13} />
//             Multi-city
//           </ModeTab>
//         </div>

//         {/* ============================================================ */}
//         {/* TWO-CITY MODE                                                */}
//         {/* ============================================================ */}
//         {mode === "two" && (
//           <>
//             <div className="mt-5 grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
//               <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
//                 <p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
//                   From
//                 </p>
//                 <LocationPicker
//                   country={fromCountry}
//                   state={fromState}
//                   onCountryChange={handleFromCountry}
//                   onStateChange={setFromState}
//                   countryOptions={countryOptions}
//                   stateOptions={fromStateOptions}
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={swap}
//                 aria-label="Swap zones"
//                 className="mx-auto grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--border-input)] bg-[var(--surface-input)] text-muted-foreground transition hover:bg-[var(--surface-btn-secondary)] hover:text-[var(--text-primary)]"
//               >
//                 <ArrowLeftRight size={15} />
//               </button>

//               <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
//                 <p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
//                   To
//                 </p>
//                 <LocationPicker
//                   country={toCountry}
//                   state={toState}
//                   onCountryChange={handleToCountry}
//                   onStateChange={setToState}
//                   countryOptions={countryOptions}
//                   stateOptions={toStateOptions}
//                 />
//               </div>
//             </div>

//             <div className="mt-6 flex flex-col gap-6">
//               {diff ? (
//                 <div className="space-y-4">
//                   <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--surface-card)] p-6 text-center">
//                     <p className="text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
//                       Time Difference
//                     </p>
//                     <p className="mt-2 font-mono text-[clamp(40px,9vw,64px)] font-bold leading-none tracking-[-.04em] text-[var(--purple)]">
//                       {diff.diffLabel}
//                     </p>
//                     <p className="mt-3 text-[14px] font-medium text-[var(--text-primary)]">
//                       {diff.diffText}
//                     </p>
//                   </div>

//                   <div className="grid gap-3 sm:grid-cols-2">
//                     {[diff.from, diff.to].map((zone, idx) => (
//                       <div
//                         key={`${zone.zone}-${idx}`}
//                         className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4"
//                       >
//                         <div className="flex items-start justify-between gap-3">
//                           <div className="min-w-0">
//                             <p className="truncate text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
//                               {zone.abbreviation} · {zone.offsetLabel}
//                             </p>
//                             <p className="mt-0.5 truncate text-[13px] font-semibold text-[var(--text-primary)]">
//                               {idx === 0 ? fromState : toState}
//                             </p>
//                           </div>
//                           <span
//                             className={cn(
//                               "grid size-8 shrink-0 place-items-center rounded-lg",
//                               zone.isDaytime
//                                 ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
//                                 : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
//                             )}
//                           >
//                             {zone.isDaytime ? (
//                               <Sun size={14} />
//                             ) : (
//                               <Moon size={14} />
//                             )}
//                           </span>
//                         </div>

//                         <p className="mt-3 font-mono text-[clamp(24px,5vw,32px)] font-bold leading-none tracking-[-.03em] text-[var(--text-primary)]">
//                           {zone.currentTime}
//                         </p>
//                         <p className="mt-1 text-[12px] text-muted-foreground">
//                           {zone.currentDate}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="rounded-2xl border border-dashed border-[var(--border-card)] p-6 text-center">
//                   <p className="text-[13px] text-muted-foreground">
//                     Pick a country and state on both sides to see the
//                     difference.
//                   </p>
//                 </div>
//               )}

//               {diff && (
//                 <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] px-4 py-3">
//                   <span className="inline-flex items-center gap-2 text-[12px] text-muted-foreground">
//                     <Clock3 size={13} />
//                     Live · updated every second
//                   </span>
//                   <CopyButton
//                     value={`${fromState} is ${diff.diffLabel} relative to ${toState}`}
//                   />
//                 </div>
//               )}
//             </div>
//           </>
//         )}

//         {/* ============================================================ */}
//         {/* MULTI-CITY MODE                                              */}
//         {/* ============================================================ */}
//         {mode === "multi" && (
//           <div className="mt-5 flex flex-col gap-4">
//             {/* Reference picker */}
//             <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
//               <p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-purple-600 dark:text-purple-400">
//                 Reference
//               </p>

//               <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
//                 <LocationPicker
//                   country={refCountry}
//                   state={refState}
//                   onCountryChange={handleRefCountry}
//                   onStateChange={setRefState}
//                   countryOptions={countryOptions}
//                   stateOptions={refStateOptions}
//                 />

//                 {refInfo && refZone && (
//                   <div className="text-left sm:text-right">
//                     <p className="font-mono text-[clamp(28px,6vw,36px)] font-bold leading-none tracking-[-.03em] text-[var(--text-primary)]">
//                       {refInfo.currentTime}
//                     </p>
//                     <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
//                       {refLabel} · {refInfo.abbreviation}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Best-call summary */}
//             {bestWindow && cities.length > 0 && (
//               <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] px-4 py-3">
//                 <div className="flex flex-wrap items-center justify-between gap-3">
//                   <div className="flex items-center gap-3">
//                     <span
//                       className={cn(
//                         "grid size-9 place-items-center rounded-lg",
//                         bestWindow.citiesInBusinessNow > 0
//                           ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
//                           : "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
//                       )}
//                     >
//                       <Phone size={15} />
//                     </span>
//                     <div>
//                       <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
//                         Best time to call — right now
//                       </p>
//                       <p className="text-[13px] font-semibold text-[var(--text-primary)]">
//                         {bestWindow.citiesInBusinessNow} of {cities.length}{" "}
//                         cities in business hours (9 AM – 6 PM)
//                       </p>
//                     </div>
//                   </div>

//                   {bestWindow.majorityHours.length > 0 && (
//                     <div className="text-left sm:text-right">
//                       <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
//                         Best window · reference time
//                       </p>
//                       <p className="font-mono text-[13px] font-semibold text-[var(--text-primary)]">
//                         {formatHourRanges(bestWindow.majorityHours)}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Toolbar */}
//             <div className="flex flex-wrap items-center justify-between gap-2">
//               <div className="flex flex-wrap items-center gap-2">
//                 <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--surface-card)] px-2 py-1">
//                   <ArrowUpDown size={12} className="text-muted-foreground" />
//                   <select
//                     value={sortMode}
//                     onChange={(e) => setSortMode(e.target.value as SortMode)}
//                     className="cursor-pointer bg-transparent text-[11px] font-bold outline-none"
//                     style={{
//                       color: "var(--text-primary)",
//                       colorScheme: "dark light",
//                     }}
//                   >
//                     <option
//                       value="added"
//                       style={{
//                         backgroundColor: "var(--surface-card)",
//                         color: "var(--text-primary)",
//                       }}
//                     >
//                       As added
//                     </option>
//                     <option
//                       value="east-west"
//                       style={{
//                         backgroundColor: "var(--surface-card)",
//                         color: "var(--text-primary)",
//                       }}
//                     >
//                       East → West
//                     </option>
//                     <option
//                       value="west-east"
//                       style={{
//                         backgroundColor: "var(--surface-card)",
//                         color: "var(--text-primary)",
//                       }}
//                     >
//                       West → East
//                     </option>
//                   </select>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => setAdding((v) => !v)}
//                   disabled={cities.length >= MAX_CITIES && !adding}
//                   className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--surface-card)] px-3 py-1.5 text-[11px] font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface-btn-secondary)] disabled:opacity-40"
//                 >
//                   {adding ? <X size={12} /> : <Plus size={12} />}
//                   {adding ? "Cancel" : "Add city"}
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setShowHeatmap((v) => !v)}
//                   className={cn(
//                     "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition",
//                     showHeatmap
//                       ? "border-[var(--purple)]/40 bg-[var(--purple)]/10 text-[var(--purple)]"
//                       : "border-[var(--border-card)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-[var(--surface-btn-secondary)]",
//                   )}
//                 >
//                   <BarChart3 size={12} />
//                   {showHeatmap ? "Hide heatmap" : "Show heatmap"}
//                 </button>
//               </div>

//               {sortedRows.length > 0 && (
//                 <div className="flex flex-wrap items-center gap-2">
//                   <CopyButton value={copyAllText} label="Copy list" />
//                   <CopyButton value={csvContent} label="Copy CSV" />
//                   <FileButton
//                     content={csvContent}
//                     filename={`timezone-comparison-${todayStamp}.csv`}
//                     mimeType="text/csv"
//                     label=".csv"
//                     icon={<FileSpreadsheet size={12} />}
//                   />
//                   <FileButton
//                     content={icsContent}
//                     filename={`timezone-comparison-${todayStamp}.ics`}
//                     mimeType="text/calendar"
//                     label=".ics"
//                     icon={<Download size={12} />}
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Add-city form */}
//             {adding && (
//               <div className="rounded-xl border border-purple-400/40 bg-purple-50/50 p-3 dark:border-purple-500/30 dark:bg-purple-500/5">
//                 <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
//                   Add a city
//                 </p>
//                 <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
//                   <SearchableSelect
//                     value={newCountry}
//                     onChange={handleNewCountry}
//                     options={countryOptions}
//                     placeholder="Country..."
//                   />
//                   <SearchableSelect
//                     value={newState}
//                     onChange={setNewState}
//                     options={newStateOptions}
//                     placeholder={
//                       newStateOptions.length === 0 ? "No states" : "State..."
//                     }
//                     disabled={newStateOptions.length === 0}
//                   />
//                   <button
//                     type="button"
//                     onClick={handleAddCity}
//                     disabled={!canAddCity}
//                     className="h-[42px] rounded-[10px] bg-purple-600 px-4 text-[13px] font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
//                   >
//                     Add
//                   </button>
//                 </div>
//                 {newState && !canAddCity && (
//                   <p className="mt-2 text-[11px] text-muted-foreground">
//                     {cities.length >= MAX_CITIES
//                       ? `Maximum ${MAX_CITIES} cities. Remove one to add more.`
//                       : "This location is already in the list."}
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* City list */}
//             {cities.length === 0 ? (
//               <div className="rounded-2xl border border-dashed border-[var(--border-card)] p-8 text-center">
//                 <p className="text-[13px] text-muted-foreground">
//                   No cities yet. Click{" "}
//                   <span className="font-bold text-[var(--text-primary)]">
//                     Add city
//                   </span>{" "}
//                   to start comparing time zones.
//                 </p>
//               </div>
//             ) : (
//               <ul className="space-y-2">
//                 {sortedRows.map((row) => (
//                   <CityRow
//                     key={row.id}
//                     row={row}
//                     onRemove={() => handleRemoveCity(row.id)}
//                   />
//                 ))}
//               </ul>
//             )}

//             {/* Heatmap */}
//             {showHeatmap && heatmap && cities.length > 0 && (
//               <HeatmapView heatmap={heatmap} referenceLabel={refLabel} />
//             )}

//             {/* Footer note */}
//             {cities.length > 0 && (
//               <p className="text-[11px] text-muted-foreground">
//                 Green rows are currently in business hours (9 AM – 6 PM) in that
//                 city. Day shift badges (+1d / −1d) indicate a different calendar
//                 day than the reference.
//               </p>
//             )}
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }


// src/features/calculators/timezone-difference/timezone-difference.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
// import { format } from "date-fns";
import {
  ArrowLeftRight,
  ArrowUpDown,
  BarChart3,
  CalendarClock,
  Check,
  Copy,
  Clock3,
  Download,
  FileSpreadsheet,
  Layers,
  Moon,
  Phone,
  Plus,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import {
  buildMultiCityIcs,
  detectLocalZone,
  findLocationForZone,
  formatHourRanges,
  getBestCallWindow,
  getCountryOptions,
  getDstTransitions,
  getHeatmap,
  getMultiCityComparison,
  getStateOptions,
  getZoneDifference,
  getZoneInfo,
  makeCityId,
  makeCityLabel,
  resolveTimezone,
  seedCities,
  sortRows,
  toMultiCityCsv,
  type DstTransition,
  type MultiCityEntry,
  type MultiCityRow,
  type Option,
  type SortMode,
} from "./logic";

const TOOL_SLUG = "timezone-difference";
const MAX_CITIES = 8;

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */

function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--surface-card)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface-btn-secondary)]"
      onClick={copy}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : label}
    </button>
  );
}

function FileButton({
  content,
  filename,
  mimeType,
  label,
  icon,
}: {
  content: string;
  filename: string;
  mimeType: string;
  label: string;
  icon: React.ReactNode;
}) {
  const download = () => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--surface-card)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface-btn-secondary)]"
    >
      {icon}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Live tick                                                          */
/* ------------------------------------------------------------------ */

const TICK_MS = 1000;
function subscribeTick(cb: () => void) {
  const id = window.setInterval(cb, TICK_MS);
  return () => window.clearInterval(id);
}
const getTick = () => Math.floor(Date.now() / TICK_MS);
const getServerTick = () => 0;

/* ------------------------------------------------------------------ */
/*  Mode tab                                                           */
/* ------------------------------------------------------------------ */

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition " +
        (active
          ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-sm"
          : "text-muted-foreground hover:text-[var(--text-primary)]")
      }
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Location picker                                                    */
/* ------------------------------------------------------------------ */

function LocationPicker({
  country,
  state,
  onCountryChange,
  onStateChange,
  countryOptions,
  stateOptions,
}: {
  country: string;
  state: string;
  onCountryChange: (v: string) => void;
  onStateChange: (v: string) => void;
  countryOptions: Option[];
  stateOptions: Option[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <SearchableSelect
        value={country}
        onChange={onCountryChange}
        options={countryOptions}
        placeholder="Country..."
      />
      <SearchableSelect
        value={state}
        onChange={onStateChange}
        options={stateOptions}
        placeholder={stateOptions.length === 0 ? "No states" : "State..."}
        disabled={stateOptions.length === 0}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  City row                                                           */
/* ------------------------------------------------------------------ */

function CityRow({
  row,
  onRemove,
}: {
  row: MultiCityRow;
  onRemove: () => void;
}) {
  const isAhead = row.diffMinutes > 0;
  const isBehind = row.diffMinutes < 0;

  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-3 py-3 transition sm:px-4",
        row.inBusinessHours
          ? "border-emerald-400/50 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-500/5"
          : "border-[var(--border-card)] bg-[var(--surface-card)]",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-xl",
          row.info.isDaytime
            ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
            : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
        )}
      >
        {row.info.isDaytime ? <Sun size={15} /> : <Moon size={15} />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-[var(--text-primary)]">
          {row.label}
        </p>
        <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {row.info.abbreviation} · {row.info.offsetLabel}
        </p>
      </div>

      <span
        className={cn(
          "hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline-flex",
          row.inBusinessHours
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
            : row.inAwakeHours
              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
        )}
      >
        {row.inBusinessHours
          ? "☎ Call now"
          : row.inAwakeHours
            ? "Awake"
            : "Asleep"}
      </span>

      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <p className="font-mono text-[clamp(14px,3.5vw,16px)] font-bold text-[var(--text-primary)]">
            {row.info.currentTime}
          </p>
          <div className="mt-0.5 flex items-center justify-end gap-1.5">
            {row.isSameAsReference ? (
              <span className="text-[10px] font-bold text-muted-foreground">
                Same as reference
              </span>
            ) : (
              <>
                <span
                  className={cn(
                    "font-mono text-[11px] font-bold",
                    isAhead
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isBehind
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-muted-foreground",
                  )}
                >
                  {row.diffLabel}
                </span>
                {row.dayShift !== 0 && (
                  <span className="rounded-full bg-[var(--surface-btn-secondary)] px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                    {row.dayShift > 0 ? "+" : "−"}
                    {Math.abs(row.dayShift)}d
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${row.label}`}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-[var(--surface-btn-secondary)] hover:text-rose-500"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Heatmap                                                            */
/* ------------------------------------------------------------------ */

function HeatmapView({
  heatmap,
  referenceLabel,
}: {
  heatmap: ReturnType<typeof getHeatmap>;
  referenceLabel: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
          <BarChart3 size={12} />
          24-hour heatmap · {referenceLabel} time
        </p>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-emerald-500" />
            Business (9–18)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-amber-400/70" />
            Awake (6–22)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-slate-300 dark:bg-slate-700" />
            Sleep
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="flex items-center">
            <div className="w-32 shrink-0" />
            <div className="flex flex-1 gap-0.5">
              {heatmap.hours.map((h) => (
                <div
                  key={h}
                  className={cn(
                    "flex-1 text-center text-[9px] font-bold",
                    h === heatmap.currentHour
                      ? "text-[var(--purple)]"
                      : "text-muted-foreground",
                  )}
                >
                  {String(h).padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>

          {heatmap.rows.map((r) => (
            <div key={r.id} className="mt-1 flex items-center">
              <div className="w-32 shrink-0 truncate pr-2 text-[11px] font-semibold text-[var(--text-primary)]">
                {r.label}
              </div>
              <div className="flex flex-1 gap-0.5">
                {r.cells.map((level, h) => (
                  <div
                    key={h}
                    className={cn(
                      "h-6 flex-1 rounded-sm transition",
                      level === "business" && "bg-emerald-500",
                      level === "awake" && "bg-amber-400/70",
                      level === "sleep" && "bg-slate-300 dark:bg-slate-700",
                      h === heatmap.currentHour &&
                        "ring-2 ring-[var(--purple)] ring-offset-1 ring-offset-[var(--surface-card)]",
                    )}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="mt-3 flex items-center">
            <div className="w-32 shrink-0 pr-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              In business
            </div>
            <div className="flex flex-1 gap-0.5">
              {heatmap.businessPerHour.map((count, h) => {
                const max = heatmap.rows.length || 1;
                const pct = (count / max) * 100;
                return (
                  <div
                    key={h}
                    className="flex h-8 flex-1 items-end overflow-hidden rounded-sm bg-[var(--surface-btn-secondary)]"
                    title={`${count} of ${max} cities in business hours`}
                  >
                    <div
                      className={cn(
                        "w-full rounded-sm transition-[height]",
                        count === max && max > 0
                          ? "bg-emerald-500"
                          : "bg-emerald-500/40",
                      )}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DST Transition card                                                */
/* ------------------------------------------------------------------ */

function TransitionCard({
  transition,
  tz,
}: {
  transition: DstTransition;
  tz: string;
}) {
  const forward = transition.direction === "forward";
  const hoursDelta = Math.abs(transition.deltaMinutes) / 60;
  const deltaLabel = Number.isInteger(hoursDelta)
    ? `${hoursDelta}h`
    : `${Math.abs(transition.deltaMinutes)}m`;

  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(transition.date);

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        forward
          ? "border-emerald-400/50 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-500/5"
          : "border-orange-400/50 bg-orange-50/40 dark:border-orange-500/30 dark:bg-orange-500/5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
            forward
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-orange-700 dark:text-orange-400",
          )}
        >
          {forward ? "↑ Spring forward" : "↓ Fall back"}
        </p>
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
            forward
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
              : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
          )}
        >
          {forward ? "+" : "−"}
          {deltaLabel}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-bold text-[var(--text-primary)]">
        {formatted}
      </p>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        {transition.fromLabel} → {transition.toLabel}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DST view                                                           */
/* ------------------------------------------------------------------ */

function DstView({
  zone,
  transitions,
  year,
}: {
  zone: string | null;
  transitions: DstTransition[];
  year: number;
}) {
  if (!zone) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border-card)] p-8 text-center">
        <CalendarClock
          size={24}
          className="mx-auto mb-2 text-muted-foreground"
        />
        <p className="text-[13px] text-muted-foreground">
          Pick a country and state to see DST transitions.
        </p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const isFuture = year > currentYear + 1;

  return (
    <div className="flex flex-col gap-4">
      {isFuture && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-50/50 p-3 dark:border-amber-500/30 dark:bg-amber-500/5">
          <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
            ⓘ DST dates for {year} may change if governments update their
            rules.
          </p>
        </div>
      )}

      {transitions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-card)] p-8 text-center">
          <CalendarClock
            size={24}
            className="mx-auto mb-2 text-muted-foreground"
          />
          <p className="text-[13px] text-muted-foreground">
            {zone.replace("_", " ")} does not observe Daylight Saving Time in{" "}
            {year}.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {transitions.map((t, i) => (
            <TransitionCard key={i} transition={t} tz={zone} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export function TimezoneDifference() {
  const countryOptions = useMemo(() => getCountryOptions(), []);
  const localZone = useMemo(() => detectLocalZone(), []);

  const initial = useMemo(() => {
    const hit = findLocationForZone(localZone);
    if (!hit) return { country: "US", state: "" };
    return { country: hit.countryIso2, state: hit.state };
  }, [localZone]);

  const [mode, setMode] = useState<"two" | "multi" | "dst">("two");

  /* -------- Two-city state -------- */
  const [fromCountry, setFromCountry] = useState(initial.country);
  const [fromState, setFromState] = useState(initial.state);
  const [toCountry, setToCountry] = useState("JP");
  const [toState, setToState] = useState("Tokyo");

  /* -------- Multi-city state -------- */
  const [refCountry, setRefCountry] = useState(initial.country);
  const [refState, setRefState] = useState(initial.state);
  const [cities, setCities] = useState<MultiCityEntry[]>(() =>
    seedCities(localZone),
  );
  const [sortMode, setSortMode] = useState<SortMode>("added");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newCountry, setNewCountry] = useState("JP");
  const [newState, setNewState] = useState(() => {
    const s = getStateOptions("JP");
    return s[0]?.value ?? "";
  });

  /* -------- DST state -------- */
  const [dstCountry, setDstCountry] = useState(initial.country);
  const [dstState, setDstState] = useState(initial.state);
  const [dstYear, setDstYear] = useState(new Date().getFullYear());

  /* -------- Live tick -------- */
  const tick = useSyncExternalStore(subscribeTick, getTick, getServerTick);
  const now = useMemo(
    () => (tick === 0 ? null : new Date(tick * TICK_MS)),
    [tick],
  );

  /* -------- Two-city computed -------- */
  const fromStateOptions = useMemo(
    () => getStateOptions(fromCountry),
    [fromCountry],
  );
  const toStateOptions = useMemo(() => getStateOptions(toCountry), [toCountry]);
  const fromZone = fromState ? resolveTimezone(fromCountry, fromState) : null;
  const toZone = toState ? resolveTimezone(toCountry, toState) : null;
  const diff = useMemo(() => {
    if (!now || !fromZone || !toZone) return null;
    return getZoneDifference(fromZone, toZone, now);
  }, [fromZone, toZone, now]);

  /* -------- Multi-city computed -------- */
  const refStateOptions = useMemo(
    () => getStateOptions(refCountry),
    [refCountry],
  );
  const newStateOptions = useMemo(
    () => getStateOptions(newCountry),
    [newCountry],
  );
  const refZone = refState ? resolveTimezone(refCountry, refState) : null;
  const refInfo = useMemo(() => {
    if (!now || !refZone) return null;
    return getZoneInfo(refZone, now);
  }, [now, refZone]);

  const rawRows = useMemo(() => {
    if (!now || !refZone) return [];
    return getMultiCityComparison(refZone, cities, now);
  }, [now, refZone, cities]);

  const sortedRows = useMemo(
    () => sortRows(rawRows, sortMode),
    [rawRows, sortMode],
  );

  const heatmap = useMemo(() => {
    if (!now || !refZone) return null;
    return getHeatmap(refZone, cities, now);
  }, [now, refZone, cities]);

  const bestWindow = useMemo(() => {
    if (!now || !refZone) return null;
    return getBestCallWindow(refZone, cities, now);
  }, [now, refZone, cities]);

  const refLabel = makeCityLabel(refCountry, refState);

  const canAddCity = useMemo(() => {
    if (!newState) return false;
    if (cities.length >= MAX_CITIES) return false;
    const zone = resolveTimezone(newCountry, newState);
    if (!zone) return false;
    if (refZone && zone === refZone) return false;
    if (cities.some((c) => c.zone === zone)) return false;
    return true;
  }, [newCountry, newState, refZone, cities]);

  /* -------- DST computed -------- */
  const dstStateOptions = useMemo(
    () => getStateOptions(dstCountry),
    [dstCountry],
  );
  const dstZone = dstState ? resolveTimezone(dstCountry, dstState) : null;
  const dstTransitions = useMemo(() => {
    if (!dstZone) return [];
    return getDstTransitions(dstZone, dstYear);
  }, [dstZone, dstYear]);

  /* -------- Handlers -------- */
  const handleFromCountry = (v: string) => {
    setFromCountry(v);
    setFromState(getStateOptions(v)[0]?.value ?? "");
  };
  const handleToCountry = (v: string) => {
    setToCountry(v);
    setToState(getStateOptions(v)[0]?.value ?? "");
  };
  const swap = () => {
    setFromCountry(toCountry);
    setFromState(toState);
    setToCountry(fromCountry);
    setToState(fromState);
  };

  const handleRefCountry = (v: string) => {
    setRefCountry(v);
    setRefState(getStateOptions(v)[0]?.value ?? "");
  };
  const handleNewCountry = (v: string) => {
    setNewCountry(v);
    setNewState(getStateOptions(v)[0]?.value ?? "");
  };

  const handleAddCity = () => {
    if (!canAddCity) return;
    const zone = resolveTimezone(newCountry, newState);
    if (!zone) return;
    setCities((prev) => [
      ...prev,
      { id: makeCityId(), countryIso2: newCountry, state: newState, zone },
    ]);
    setAdding(false);
  };

  const handleRemoveCity = (id: string) =>
    setCities((prev) => prev.filter((c) => c.id !== id));

  const handleDstCountry = (v: string) => {
    setDstCountry(v);
    setDstState(getStateOptions(v)[0]?.value ?? "");
  };

  /* -------- Export content -------- */
  const copyAllText = useMemo(() => {
    if (!refInfo || !refZone) return "";
    const lines = [
      `Reference: ${refLabel} — ${refInfo.currentTime} ${refInfo.abbreviation}`,
    ];
    sortedRows.forEach((r) => {
      const suffix = r.isSameAsReference
        ? "same as reference"
        : `${r.diffLabel}${
            r.dayShift !== 0
              ? `, ${r.dayShift > 0 ? "+" : "−"}${Math.abs(r.dayShift)}d`
              : ""
          }`;
      lines.push(
        `${r.label} — ${r.info.currentTime} ${r.info.abbreviation} (${suffix})`,
      );
    });
    return lines.join("\n");
  }, [refInfo, refZone, refLabel, sortedRows]);

  const csvContent = useMemo(
    () => toMultiCityCsv(refLabel, sortedRows),
    [refLabel, sortedRows],
  );

  const icsContent = useMemo(() => {
    if (!now) return "";
    return buildMultiCityIcs(refLabel, sortedRows, now);
  }, [refLabel, sortedRows, now]);

  const todayStamp = useMemo(() => {
    const d = now ?? new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  }, [now]);

  /* -------- DST year options -------- */
  const dstYearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => {
      const y = current - 5 + i;
      return { value: String(y), label: String(y) };
    });
  }, []);

  return (
    <div className="space-y-4">
      <section className="tool-card rounded-3xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 sm:p-7">
        <ToolCardHeader slug={TOOL_SLUG} />

        {/* Mode toggle */}
        <div className="mt-5 inline-flex flex-wrap rounded-xl bg-[var(--surface-btn-secondary)] p-1">
          <ModeTab active={mode === "two"} onClick={() => setMode("two")}>
            <ArrowLeftRight size={13} />
            Two cities
          </ModeTab>
          <ModeTab active={mode === "multi"} onClick={() => setMode("multi")}>
            <Layers size={13} />
            Multi-city
          </ModeTab>
          <ModeTab active={mode === "dst"} onClick={() => setMode("dst")}>
            <CalendarClock size={13} />
            DST transitions
          </ModeTab>
        </div>

        {/* ============================================================ */}
        {/* TWO-CITY MODE                                                */}
        {/* ============================================================ */}
        {mode === "two" && (
          <>
            <div className="mt-5 grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
              <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
                  From
                </p>
                <LocationPicker
                  country={fromCountry}
                  state={fromState}
                  onCountryChange={handleFromCountry}
                  onStateChange={setFromState}
                  countryOptions={countryOptions}
                  stateOptions={fromStateOptions}
                />
              </div>

              <button
                type="button"
                onClick={swap}
                aria-label="Swap zones"
                className="mx-auto grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--border-input)] bg-[var(--surface-input)] text-muted-foreground transition hover:bg-[var(--surface-btn-secondary)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeftRight size={15} />
              </button>

              <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
                  To
                </p>
                <LocationPicker
                  country={toCountry}
                  state={toState}
                  onCountryChange={handleToCountry}
                  onStateChange={setToState}
                  countryOptions={countryOptions}
                  stateOptions={toStateOptions}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-6">
              {diff ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--surface-card)] p-6 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
                      Time Difference
                    </p>
                    <p className="mt-2 font-mono text-[clamp(40px,9vw,64px)] font-bold leading-none tracking-[-.04em] text-[var(--purple)]">
                      {diff.diffLabel}
                    </p>
                    <p className="mt-3 text-[14px] font-medium text-[var(--text-primary)]">
                      {diff.diffText}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[diff.from, diff.to].map((zone, idx) => (
                      <div
                        key={`${zone.zone}-${idx}`}
                        className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              {zone.abbreviation} · {zone.offsetLabel}
                            </p>
                            <p className="mt-0.5 truncate text-[13px] font-semibold text-[var(--text-primary)]">
                              {idx === 0 ? fromState : toState}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "grid size-8 shrink-0 place-items-center rounded-lg",
                              zone.isDaytime
                                ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                                : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
                            )}
                          >
                            {zone.isDaytime ? (
                              <Sun size={14} />
                            ) : (
                              <Moon size={14} />
                            )}
                          </span>
                        </div>

                        <p className="mt-3 font-mono text-[clamp(24px,5vw,32px)] font-bold leading-none tracking-[-.03em] text-[var(--text-primary)]">
                          {zone.currentTime}
                        </p>
                        <p className="mt-1 text-[12px] text-muted-foreground">
                          {zone.currentDate}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--border-card)] p-6 text-center">
                  <p className="text-[13px] text-muted-foreground">
                    Pick a country and state on both sides to see the
                    difference.
                  </p>
                </div>
              )}

              {diff && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-[12px] text-muted-foreground">
                    <Clock3 size={13} />
                    Live · updated every second
                  </span>
                  <CopyButton
                    value={`${fromState} is ${diff.diffLabel} relative to ${toState}`}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* MULTI-CITY MODE                                              */}
        {/* ============================================================ */}
        {mode === "multi" && (
          <div className="mt-5 flex flex-col gap-4">
            <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-purple-600 dark:text-purple-400">
                Reference
              </p>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <LocationPicker
                  country={refCountry}
                  state={refState}
                  onCountryChange={handleRefCountry}
                  onStateChange={setRefState}
                  countryOptions={countryOptions}
                  stateOptions={refStateOptions}
                />

                {refInfo && refZone && (
                  <div className="text-left sm:text-right">
                    <p className="font-mono text-[clamp(28px,6vw,36px)] font-bold leading-none tracking-[-.03em] text-[var(--text-primary)]">
                      {refInfo.currentTime}
                    </p>
                    <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {refLabel} · {refInfo.abbreviation}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {bestWindow && cities.length > 0 && (
              <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-lg",
                        bestWindow.citiesInBusinessNow > 0
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
                      )}
                    >
                      <Phone size={15} />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Best time to call — right now
                      </p>
                      <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                        {bestWindow.citiesInBusinessNow} of {cities.length}{" "}
                        cities in business hours (9 AM – 6 PM)
                      </p>
                    </div>
                  </div>

                  {bestWindow.majorityHours.length > 0 && (
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Best window · reference time
                      </p>
                      <p className="font-mono text-[13px] font-semibold text-[var(--text-primary)]">
                        {formatHourRanges(bestWindow.majorityHours)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--surface-card)] px-2 py-1">
                  <ArrowUpDown size={12} className="text-muted-foreground" />
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="cursor-pointer bg-transparent text-[11px] font-bold outline-none"
                    style={{
                      color: "var(--text-primary)",
                      colorScheme: "dark light",
                    }}
                  >
                    <option
                      value="added"
                      style={{
                        backgroundColor: "var(--surface-card)",
                        color: "var(--text-primary)",
                      }}
                    >
                      As added
                    </option>
                    <option
                      value="east-west"
                      style={{
                        backgroundColor: "var(--surface-card)",
                        color: "var(--text-primary)",
                      }}
                    >
                      East → West
                    </option>
                    <option
                      value="west-east"
                      style={{
                        backgroundColor: "var(--surface-card)",
                        color: "var(--text-primary)",
                      }}
                    >
                      West → East
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setAdding((v) => !v)}
                  disabled={cities.length >= MAX_CITIES && !adding}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--surface-card)] px-3 py-1.5 text-[11px] font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface-btn-secondary)] disabled:opacity-40"
                >
                  {adding ? <X size={12} /> : <Plus size={12} />}
                  {adding ? "Cancel" : "Add city"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowHeatmap((v) => !v)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition",
                    showHeatmap
                      ? "border-[var(--purple)]/40 bg-[var(--purple)]/10 text-[var(--purple)]"
                      : "border-[var(--border-card)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-[var(--surface-btn-secondary)]",
                  )}
                >
                  <BarChart3 size={12} />
                  {showHeatmap ? "Hide heatmap" : "Show heatmap"}
                </button>
              </div>

              {sortedRows.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <CopyButton value={copyAllText} label="Copy list" />
                  <CopyButton value={csvContent} label="Copy CSV" />
                  <FileButton
                    content={csvContent}
                    filename={`timezone-comparison-${todayStamp}.csv`}
                    mimeType="text/csv"
                    label=".csv"
                    icon={<FileSpreadsheet size={12} />}
                  />
                  <FileButton
                    content={icsContent}
                    filename={`timezone-comparison-${todayStamp}.ics`}
                    mimeType="text/calendar"
                    label=".ics"
                    icon={<Download size={12} />}
                  />
                </div>
              )}
            </div>

            {adding && (
              <div className="rounded-xl border border-purple-400/40 bg-purple-50/50 p-3 dark:border-purple-500/30 dark:bg-purple-500/5">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Add a city
                </p>
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <SearchableSelect
                    value={newCountry}
                    onChange={handleNewCountry}
                    options={countryOptions}
                    placeholder="Country..."
                  />
                  <SearchableSelect
                    value={newState}
                    onChange={setNewState}
                    options={newStateOptions}
                    placeholder={
                      newStateOptions.length === 0 ? "No states" : "State..."
                    }
                    disabled={newStateOptions.length === 0}
                  />
                  <button
                    type="button"
                    onClick={handleAddCity}
                    disabled={!canAddCity}
                    className="h-[42px] rounded-[10px] bg-purple-600 px-4 text-[13px] font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
                {newState && !canAddCity && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {cities.length >= MAX_CITIES
                      ? `Maximum ${MAX_CITIES} cities. Remove one to add more.`
                      : "This location is already in the list."}
                  </p>
                )}
              </div>
            )}

            {cities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border-card)] p-8 text-center">
                <p className="text-[13px] text-muted-foreground">
                  No cities yet. Click{" "}
                  <span className="font-bold text-[var(--text-primary)]">
                    Add city
                  </span>{" "}
                  to start comparing time zones.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {sortedRows.map((row) => (
                  <CityRow
                    key={row.id}
                    row={row}
                    onRemove={() => handleRemoveCity(row.id)}
                  />
                ))}
              </ul>
            )}

            {showHeatmap && heatmap && cities.length > 0 && (
              <HeatmapView heatmap={heatmap} referenceLabel={refLabel} />
            )}

            {cities.length > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Green rows are currently in business hours (9 AM – 6 PM) in that
                city. Day shift badges (+1d / −1d) indicate a different calendar
                day than the reference.
              </p>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* DST TRANSITIONS MODE                                         */}
        {/* ============================================================ */}
        {mode === "dst" && (
          <div className="mt-5 flex flex-col gap-4">
            {/* Location + year selector */}
            <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
              <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">
                <CalendarClock size={12} />
                Daylight Saving Time
              </p>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px]">
                <SearchableSelect
                  value={dstCountry}
                  onChange={handleDstCountry}
                  options={countryOptions}
                  placeholder="Country..."
                />
                <SearchableSelect
                  value={dstState}
                  onChange={setDstState}
                  options={dstStateOptions}
                  placeholder={
                    dstStateOptions.length === 0 ? "No states" : "State..."
                  }
                  disabled={dstStateOptions.length === 0}
                />
                <SearchableSelect
                  value={String(dstYear)}
                  onChange={(v) => setDstYear(Number(v))}
                  options={dstYearOptions}
                />
              </div>

              {dstZone && (
                <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Zone: {dstZone}
                </p>
              )}
            </div>

            {/* Transitions list */}
            <DstView
              zone={dstZone}
              transitions={dstTransitions}
              year={dstYear}
            />

            {/* Footer */}
            <p className="text-[11px] text-muted-foreground">
              DST rules are defined by the IANA time zone database. Dates are
              accurate for the current and next year; future years may change
              if governments update their rules.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
