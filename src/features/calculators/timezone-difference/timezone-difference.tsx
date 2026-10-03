// // src/features/calculators/timezone-difference/timezone-difference.tsx
// "use client";

// import { useMemo, useState, useSyncExternalStore } from "react";
// import { ArrowLeftRight, Check, Copy, Clock3, Moon, Sun } from "lucide-react";
// import { ToolCardHeader } from "@/components/ui/tool-card-header";
// import { SearchableSelect } from "@/components/ui/searchable-select";
// import { cn } from "@/lib/utils";
// import {
//   detectLocalZone,
//   findCityForZone,
//   getCityOptions,
//   getCountryOptions,
//   getStateOptions,
//   getZoneDifference,
//   resolveCityLabel,
//   resolveTimezone,
//   type Option,
// } from "./logic";

// const TOOL_SLUG = "timezone-difference";

// /* ------------------------------------------------------------------ */
// /*  Copy button                                                        */
// /* ------------------------------------------------------------------ */

// function CopyButton({ value }: { value: string }) {
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
//       onClick={copy}
//       className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--purple)] transition hover:opacity-80"
//     >
//       {copied ? <Check size={13} /> : <Copy size={13} />}
//       {copied ? "Copied" : "Copy"}
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
// /*  Three-level cascading selector (Country → State → City)            */
// /* ------------------------------------------------------------------ */

// function SideSelector({
//   title,
//   country,
//   state,
//   city,
//   onCountryChange,
//   onStateChange,
//   onCityChange,
//   countryOptions,
//   stateOptions,
//   cityOptions,
// }: {
//   title: string;
//   country: string;
//   state: string;
//   city: string;
//   onCountryChange: (v: string) => void;
//   onStateChange: (v: string) => void;
//   onCityChange: (v: string) => void;
//   countryOptions: Option[];
//   stateOptions: Option[];
//   cityOptions: Option[];
// }) {
//   return (
//     <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
//       <p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
//         {title}
//       </p>

//       <div className="grid gap-2 sm:grid-cols-3">
//         <SearchableSelect
//           value={country}
//           onChange={onCountryChange}
//           options={countryOptions}
//           placeholder="Country..."
//         />
//         <SearchableSelect
//           value={state}
//           onChange={onStateChange}
//           options={stateOptions}
//           placeholder={stateOptions.length === 0 ? "No states" : "State..."}
//           disabled={stateOptions.length === 0}
//         />
//         <SearchableSelect
//           value={city}
//           onChange={onCityChange}
//           options={cityOptions}
//           placeholder={cityOptions.length === 0 ? "No cities" : "City..."}
//           disabled={cityOptions.length === 0}
//         />
//       </div>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Main Component                                                     */
// /* ------------------------------------------------------------------ */

// export function TimezoneDifference() {
//   const countryOptions = useMemo(() => getCountryOptions(), []);

//   /* Auto-detect local zone and resolve to country/state/city */
//   const initialFrom = useMemo(() => {
//     const zone = detectLocalZone();
//     const hit = findCityForZone(zone);
//     if (!hit) return { country: "US", state: "", city: "" };
//     return {
//       country: hit.countryIso2,
//       state: hit.province,
//       city: hit.cityKey,
//     };
//   }, []);

//   /* FROM side state */
//   const [fromCountry, setFromCountry] = useState(initialFrom.country);
//   const [fromState, setFromState] = useState(initialFrom.state);
//   const [fromCity, setFromCity] = useState(initialFrom.city);

//   /* TO side state */
//   const [toCountry, setToCountry] = useState("JP");
//   const [toState, setToState] = useState("Tokyo");
//   const [toCity, setToCity] = useState("JP|Tokyo|Tokyo");

//   /* Derived option lists */
//   const fromStateOptions = useMemo(
//     () => getStateOptions(fromCountry),
//     [fromCountry]
//   );
//   const fromCityOptions = useMemo(
//     () => (fromState ? getCityOptions(fromCountry, fromState) : []),
//     [fromCountry, fromState]
//   );

//   const toStateOptions = useMemo(
//     () => getStateOptions(toCountry),
//     [toCountry]
//   );
//   const toCityOptions = useMemo(
//     () => (toState ? getCityOptions(toCountry, toState) : []),
//     [toCountry, toState]
//   );

//   /* Live tick */
//   const tick = useSyncExternalStore(subscribeTick, getTick, getServerTick);
//   const now = useMemo(
//     () => (tick === 0 ? null : new Date(tick * TICK_MS)),
//     [tick]
//   );

//   /* Resolve to IANA zones */
//   const fromZone = fromCity ? resolveTimezone(fromCity) : null;
//   const toZone = toCity ? resolveTimezone(toCity) : null;

//   const diff = useMemo(() => {
//     if (!now || !fromZone || !toZone) return null;
//     return getZoneDifference(fromZone, toZone, now);
//   }, [fromZone, toZone, now]);

//   /* Handlers that cascade-clear downstream dropdowns */
//   const handleFromCountry = (v: string) => {
//     setFromCountry(v);
//     const states = getStateOptions(v);
//     const nextState = states[0]?.value ?? "";
//     setFromState(nextState);
//     const cities = nextState ? getCityOptions(v, nextState) : [];
//     setFromCity(cities[0]?.value ?? "");
//   };

//   const handleFromState = (v: string) => {
//     setFromState(v);
//     const cities = getCityOptions(fromCountry, v);
//     setFromCity(cities[0]?.value ?? "");
//   };

//   const handleToCountry = (v: string) => {
//     setToCountry(v);
//     const states = getStateOptions(v);
//     const nextState = states[0]?.value ?? "";
//     setToState(nextState);
//     const cities = nextState ? getCityOptions(v, nextState) : [];
//     setToCity(cities[0]?.value ?? "");
//   };

//   const handleToState = (v: string) => {
//     setToState(v);
//     const cities = getCityOptions(toCountry, v);
//     setToCity(cities[0]?.value ?? "");
//   };

//   const swap = () => {
//     setFromCountry(toCountry);
//     setFromState(toState);
//     setFromCity(toCity);
//     setToCountry(fromCountry);
//     setToState(fromState);
//     setToCity(fromCity);
//   };

//   /* Friendly display labels for the two selected cities */
//   const fromLabel = fromCity ? resolveCityLabel(fromCity) : "";
//   const toLabel = toCity ? resolveCityLabel(toCity) : "";

//   return (
//     <div className="space-y-4">
//       <section className="tool-card rounded-3xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 sm:p-7">
//         <ToolCardHeader slug={TOOL_SLUG} />

//         {/* Two side selectors + swap button */}
//         <div className="mt-5 grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
//           <SideSelector
//             title="From"
//             country={fromCountry}
//             state={fromState}
//             city={fromCity}
//             onCountryChange={handleFromCountry}
//             onStateChange={handleFromState}
//             onCityChange={setFromCity}
//             countryOptions={countryOptions}
//             stateOptions={fromStateOptions}
//             cityOptions={fromCityOptions}
//           />

//           <button
//             type="button"
//             onClick={swap}
//             aria-label="Swap zones"
//             className="mx-auto grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--border-input)] bg-[var(--surface-input)] text-muted-foreground transition hover:bg-[var(--surface-btn-secondary)] hover:text-[var(--text-primary)]"
//           >
//             <ArrowLeftRight size={15} />
//           </button>

//           <SideSelector
//             title="To"
//             country={toCountry}
//             state={toState}
//             city={toCity}
//             onCountryChange={handleToCountry}
//             onStateChange={handleToState}
//             onCityChange={setToCity}
//             countryOptions={countryOptions}
//             stateOptions={toStateOptions}
//             cityOptions={toCityOptions}
//           />
//         </div>

//         {/* Main content */}
//         <div className="mt-6 flex flex-col gap-6">
//           {diff ? (
//             <div className="space-y-4">
//               {/* Big diff header */}
//               <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--surface-card)] p-6 text-center">
//                 <p className="text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
//                   Time Difference
//                 </p>
//                 <p className="mt-2 font-mono text-[clamp(40px,9vw,64px)] font-bold leading-none tracking-[-.04em] text-[var(--purple)]">
//                   {diff.diffLabel}
//                 </p>
//                 <p className="mt-3 text-[14px] font-medium text-[var(--text-primary)]">
//                   {diff.diffText}
//                 </p>
//               </div>

//               {/* Side-by-side clocks */}
//               <div className="grid gap-3 sm:grid-cols-2">
//                 {[diff.from, diff.to].map((zone, idx) => (
//                   <div
//                     key={`${zone.zone}-${idx}`}
//                     className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4"
//                   >
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="min-w-0">
//                         <p className="truncate text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
//                           {zone.abbreviation} · {zone.offsetLabel}
//                         </p>
//                         <p className="mt-0.5 truncate text-[13px] font-semibold text-[var(--text-primary)]">
//                           {idx === 0 ? fromLabel : toLabel}
//                         </p>
//                       </div>
//                       <span
//                         className={cn(
//                           "grid size-8 shrink-0 place-items-center rounded-lg",
//                           zone.isDaytime
//                             ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
//                             : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
//                         )}
//                       >
//                         {zone.isDaytime ? <Sun size={14} /> : <Moon size={14} />}
//                       </span>
//                     </div>

//                     <p className="mt-3 font-mono text-[clamp(24px,5vw,32px)] font-bold leading-none tracking-[-.03em] text-[var(--text-primary)]">
//                       {zone.currentTime}
//                     </p>
//                     <p className="mt-1 text-[12px] text-muted-foreground">
//                       {zone.currentDate}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div className="rounded-2xl border border-dashed border-[var(--border-card)] p-6 text-center">
//               <p className="text-[13px] text-muted-foreground">
//                 Pick a country, state, and city on both sides to see the difference.
//               </p>
//             </div>
//           )}

//           {/* Footer */}
//           {diff && (
//             <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] px-4 py-3">
//               <span className="inline-flex items-center gap-2 text-[12px] text-muted-foreground">
//                 <Clock3 size={13} />
//                 Live · updated every second
//               </span>
//               <CopyButton
//                 value={`${fromLabel} is ${diff.diffLabel} relative to ${toLabel}`}
//               />
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }


// src/features/calculators/timezone-difference/timezone-difference.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowLeftRight, Check, Copy, Clock3, Moon, Sun } from "lucide-react";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import {
  detectLocalZone,
  findLocationForZone,
  getCountryOptions,
  getStateOptions,
  getZoneDifference,
  resolveTimezone,
  type Option,
} from "./logic";

const TOOL_SLUG = "timezone-difference";

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */

function CopyButton({ value }: { value: string }) {
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
      onClick={copy}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--purple)] transition hover:opacity-80"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
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
/*  Two-level selector (Country → State)                               */
/* ------------------------------------------------------------------ */

function SideSelector({
  title,
  country,
  state,
  onCountryChange,
  onStateChange,
  countryOptions,
  stateOptions,
}: {
  title: string;
  country: string;
  state: string;
  onCountryChange: (v: string) => void;
  onStateChange: (v: string) => void;
  countryOptions: Option[];
  stateOptions: Option[];
}) {
  return (
    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
        {title}
      </p>

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
          placeholder={stateOptions.length === 0 ? "No states" : "State / Province..."}
          disabled={stateOptions.length === 0}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function TimezoneDifference() {
  const countryOptions = useMemo(() => getCountryOptions(), []);

  /* Auto-detect local zone and resolve to country + state */
  const initialFrom = useMemo(() => {
    const zone = detectLocalZone();
    const hit = findLocationForZone(zone);
    if (!hit) return { country: "US", state: "" };
    return { country: hit.countryIso2, state: hit.state };
  }, []);

  const [fromCountry, setFromCountry] = useState(initialFrom.country);
  const [fromState, setFromState] = useState(initialFrom.state);

  const [toCountry, setToCountry] = useState("JP");
  const [toState, setToState] = useState("Tokyo");

  const fromStateOptions = useMemo(
    () => getStateOptions(fromCountry),
    [fromCountry]
  );
  const toStateOptions = useMemo(
    () => getStateOptions(toCountry),
    [toCountry]
  );

  /* Live tick */
  const tick = useSyncExternalStore(subscribeTick, getTick, getServerTick);
  const now = useMemo(
    () => (tick === 0 ? null : new Date(tick * TICK_MS)),
    [tick]
  );

  /* Resolve zones */
  const fromZone = fromState ? resolveTimezone(fromCountry, fromState) : null;
  const toZone = toState ? resolveTimezone(toCountry, toState) : null;

  const diff = useMemo(() => {
    if (!now || !fromZone || !toZone) return null;
    return getZoneDifference(fromZone, toZone, now);
  }, [fromZone, toZone, now]);

  /* Handlers that cascade-clear the state dropdown */
  const handleFromCountry = (v: string) => {
    setFromCountry(v);
    const states = getStateOptions(v);
    setFromState(states[0]?.value ?? "");
  };

  const handleToCountry = (v: string) => {
    setToCountry(v);
    const states = getStateOptions(v);
    setToState(states[0]?.value ?? "");
  };

  const swap = () => {
    setFromCountry(toCountry);
    setFromState(toState);
    setToCountry(fromCountry);
    setToState(fromState);
  };

  return (
    <div className="space-y-4">
      <section className="tool-card rounded-3xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 sm:p-7">
        <ToolCardHeader slug={TOOL_SLUG} />

        {/* Two side selectors + swap button */}
        <div className="mt-5 grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <SideSelector
            title="From"
            country={fromCountry}
            state={fromState}
            onCountryChange={handleFromCountry}
            onStateChange={setFromState}
            countryOptions={countryOptions}
            stateOptions={fromStateOptions}
          />

          <button
            type="button"
            onClick={swap}
            aria-label="Swap zones"
            className="mx-auto grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--border-input)] bg-[var(--surface-input)] text-muted-foreground transition hover:bg-[var(--surface-btn-secondary)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeftRight size={15} />
          </button>

          <SideSelector
            title="To"
            country={toCountry}
            state={toState}
            onCountryChange={handleToCountry}
            onStateChange={setToState}
            countryOptions={countryOptions}
            stateOptions={toStateOptions}
          />
        </div>

        {/* Main content */}
        <div className="mt-6 flex flex-col gap-6">
          {diff ? (
            <div className="space-y-4">
              {/* Big diff header */}
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

              {/* Side-by-side clocks */}
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
                            : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                        )}
                      >
                        {zone.isDaytime ? <Sun size={14} /> : <Moon size={14} />}
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
                Pick a country and state on both sides to see the difference.
              </p>
            </div>
          )}

          {/* Footer */}
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
      </section>
    </div>
  );
}