// "use client";

// import { useMemo, useState, useSyncExternalStore } from "react";
// import {
//   Check,
//   Copy,
//   Hourglass,
//   Pause,
//   Play,
//   RotateCcw,
//   Save,
// } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ResultPanel } from "@/components/ui/result-card";
// import { ToolCardHeader } from "@/components/ui/tool-card-header";
// import { useHistory } from "@/components/history/history-context";
// import {
//   computeCountdown,
//   CUSTOM_UNITS,
//   customToMs,
//   parseDateTime,
//   PRESETS,
//   summarize,
//   toIso,
//   toTime,
//   type CustomUnit,
// } from "./logic";

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
//       className="inline-flex items-center gap-1.5 text-xs font-bold text-primary transition hover:opacity-80"
//     >
//       {copied ? <Check size={13} /> : <Copy size={13} />}
//       {copied ? "Copied" : "Copy"}
//     </button>
//   );
// }

// const TOOL_SLUG = "countdown";

// /* Live tick — SSR-safe. Ticks 4x per second so the display changes exactly
//    when a second boundary is crossed (no visible lag). */
// const TICK_MS = 250;
// function subscribeTick(cb: () => void) {
//   const id = window.setInterval(cb, TICK_MS);
//   return () => window.clearInterval(id);
// }
// const getTick = () => Math.floor(Date.now() / TICK_MS);
// const getServerTick = () => 0;

// function defaultTarget(): { date: string; time: string } {
//   const d = new Date();
//   d.setMinutes(d.getMinutes() + 5);
//   return { date: toIso(d), time: toTime(d) };
// }

// type Status = "idle" | "running" | "paused";

// export function Countdown() {
//   const initial = useMemo(() => defaultTarget(), []);
//   const [dateInput, setDateInput] = useState(initial.date);
//   const [timeInput, setTimeInput] = useState(initial.time);
//   const [justSaved, setJustSaved] = useState(false);
//   const { addEntry, hasSignature } = useHistory();

//   // Runtime state (all timestamps are in milliseconds)
//   const [status, setStatus] = useState<Status>("idle");
//   const [startedAt, setStartedAt] = useState<number | null>(null);
//   const [pausedAt, setPausedAt] = useState<number | null>(null);
//   const [runTarget, setRunTarget] = useState<number | null>(null);

//   // Duration mode: set by "5 min" style presets and by the custom input.
//   const [durationMs, setDurationMs] = useState<number | null>(null);

//   // Custom duration input
//   const [customValue, setCustomValue] = useState("");
//   const [customUnit, setCustomUnit] = useState<CustomUnit>("minutes");
//   // True when the user is driving the timer from the custom box.
//   const [useCustom, setUseCustom] = useState(false);

//   const tick = useSyncExternalStore(subscribeTick, getTick, getServerTick);

//   // While running/paused use the real target; otherwise the form's target.
//   const target = useMemo(
//     () =>
//       runTarget !== null
//         ? new Date(runTarget)
//         : parseDateTime(dateInput, timeInput),
//     [runTarget, dateInput, timeInput]
//   );

//   // "now" depends on status.
//   const now = useMemo(() => {
//     if (status === "idle") return null;
//     if (status === "paused" && pausedAt !== null) return new Date(pausedAt);
//     if (tick === 0) return null;
//     const t = tick * TICK_MS;
//     // The tick can be up to 250ms old right after Start; never go before it.
//     return new Date(startedAt !== null ? Math.max(t, startedAt) : t);
//   }, [status, pausedAt, tick, startedAt]);

//   // Origin for the progress bar — when Start was pressed.
//   const origin = useMemo(
//     () => (startedAt !== null ? new Date(startedAt) : null),
//     [startedAt]
//   );

//   const parts = useMemo(
//     () => (target && now ? computeCountdown(target, origin, now) : null),
//     [target, now, origin]
//   );

//   const customMs = useMemo(
//     () => customToMs(customValue, customUnit),
//     [customValue, customUnit]
//   );

//   // What to show on the idle panel when a duration (preset or custom) is set.
//   const previewMs = useCustom ? customMs : durationMs;
//   const previewParts = useMemo(
//     () =>
//       previewMs !== null
//         ? computeCountdown(new Date(previewMs), new Date(0), new Date(0))
//         : null,
//     [previewMs]
//   );

//   const customError =
//     customValue.trim() !== "" && customMs === null
//       ? "Enter a number greater than 0 (up to 10 years)."
//       : null;

//   const signature =
//     durationMs !== null ? `dur:${durationMs}` : `${dateInput}|${timeInput}`;
//   const alreadySaved = hasSignature(TOOL_SLUG, signature);
//   const canSave = Boolean(parts) && !alreadySaved;

//   /* ---------------- Controls ---------------- */

//   const launch = (nowMs: number, targetMs: number, dur: number | null) => {
//     setRunTarget(targetMs);
//     setStartedAt(nowMs);
//     setPausedAt(null);
//     setDurationMs(dur);
//     setStatus("running");
//   };

//   // One Start button for everything: custom timer, presets, or date/time.
//   const start = () => {
//     const nowMs = Date.now();
//     if (useCustom) {
//       if (customMs === null) return;
//       const t = new Date(nowMs + customMs);
//       setDateInput(toIso(t));
//       setTimeInput(toTime(t));
//       launch(nowMs, nowMs + customMs, customMs);
//     } else if (durationMs !== null) {
//       // Exact duration counted from this click -> starts at exactly 5:00.
//       launch(nowMs, nowMs + durationMs, durationMs);
//     } else if (target) {
//       launch(nowMs, target.getTime(), null);
//     }
//   };

//   const pause = () => {
//     setPausedAt(Date.now());
//     setStatus("paused");
//   };

//   const resume = () => {
//     if (pausedAt !== null) {
//       // Shift target and origin forward by the time spent paused, so the
//       // remaining time and the progress bar both stay exactly the same.
//       const delta = Date.now() - pausedAt;
//       setRunTarget((t) => (t !== null ? t + delta : t));
//       setStartedAt((s) => (s !== null ? s + delta : s));
//     }
//     setPausedAt(null);
//     setStatus("running");
//   };

//   const clearRun = () => {
//     setStatus("idle");
//     setStartedAt(null);
//     setPausedAt(null);
//     setRunTarget(null);
//   };

//   const reset = () => {
//     clearRun();
//     setDurationMs(null);
//     setUseCustom(false);
//     setCustomValue("");
//     const d = defaultTarget();
//     setDateInput(d.date);
//     setTimeInput(d.time);
//   };

//   const applyPreset = (label: string) => {
//     const preset = PRESETS.find((p) => p.label === label);
//     if (!preset) return;
//     const t = preset.target(new Date());
//     clearRun();
//     setUseCustom(false);
//     setDurationMs(preset.durationMs ?? null);
//     setDateInput(toIso(t));
//     setTimeInput(toTime(t));
//   };

//   // User edited the date/time manually.
//   const changeTarget = () => {
//     clearRun();
//     setUseCustom(false);
//     setDurationMs(null);
//   };

//   const saveToHistory = () => {
//     if (!parts || !canSave || !target) return;
//     addEntry({
//       tool: TOOL_SLUG,
//       toolName: "Countdown",
//       signature,
//       summary: parts.expired
//         ? "Expired"
//         : `${parts.days}d ${parts.hours}h ${parts.minutes}m`,
//       details: {
//         Target: `${dateInput} ${timeInput}`,
//         Remaining: parts.expired ? "0" : summarize(parts).replace("in ", ""),
//       },
//     });
//     setJustSaved(true);
//     window.setTimeout(() => setJustSaved(false), 1400);
//   };

//   const buttonLabel = justSaved
//     ? "Saved to history"
//     : alreadySaved
//       ? "Already in history"
//       : "Save to history";

//   /* Panel title */
//   const panelTitle = parts?.expired
//     ? "Expired"
//     : status === "idle"
//       ? "Ready"
//       : status === "paused"
//         ? "Paused"
//         : "Counting down";

//   const canStartMain = useCustom
//     ? customMs !== null
//     : durationMs !== null || Boolean(target);

//   return (
//     <div className="space-y-6">
//       <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
//         <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] lg:gap-8">
//           {/* LEFT: header + form */}
//           <div className="min-w-0">
//             <ToolCardHeader slug={TOOL_SLUG} />

//             <div className="grid gap-4 sm:grid-cols-2">
//               <Input
//                 label="Target date"
//                 type="date"
//                 name="date"
//                 value={dateInput}
//                 disabled={status === "running"}
//                 onChange={(e) => {
//                   changeTarget();
//                   setDateInput(e.target.value);
//                 }}
//               />
//               <Input
//                 label="Target time"
//                 type="time"
//                 name="time"
//                 value={timeInput}
//                 disabled={status === "running"}
//                 onChange={(e) => {
//                   changeTarget();
//                   setTimeInput(e.target.value);
//                 }}
//               />
//             </div>

//             {/* Presets */}
//             <div className="mt-4">
//               <p className="mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
//                 Quick set
//               </p>
//               <div className="flex flex-wrap gap-2">
//                 {PRESETS.map((p) => (
//                   <button
//                     key={p.label}
//                     type="button"
//                     onClick={() => applyPreset(p.label)}
//                     disabled={status === "running"}
//                     className="rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:opacity-40"
//                   >
//                     {p.label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Custom duration */}
//             <div className="mt-4">
//               <p className="mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
//                 Custom timer
//               </p>
//               <div className="flex flex-wrap items-end gap-2">
//                 <div className="min-w-[110px] flex-1">
//                   <Input
//                     label="Amount"
//                     type="number"
//                     name="custom-amount"
//                     inputMode="decimal"
//                     min="0"
//                     step="any"
//                     placeholder="e.g. 90"
//                     value={customValue}
//                     disabled={status !== "idle"}
//                     onChange={(e) => {
//                       setCustomValue(e.target.value);
//                       setUseCustom(true);
//                     }}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") {
//                         e.preventDefault();
//                         if (canStartMain) start();
//                       }
//                     }}
//                   />
//                 </div>
//                 <select
//                   aria-label="Custom timer unit"
//                   value={customUnit}
//                   disabled={status !== "idle"}
//                   onChange={(e) => {
//                     setCustomUnit(e.target.value as CustomUnit);
//                     if (customValue.trim() !== "") setUseCustom(true);
//                   }}
//                   className="min-h-10 rounded-xl border border-border bg-background/60 px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary/60 disabled:opacity-40"
//                 >
//                   {CUSTOM_UNITS.map((u) => (
//                     <option key={u.value} value={u.value}>
//                       {u.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {customError && (
//                 <p className="mt-2 text-xs text-red-500">{customError}</p>
//               )}
//             </div>

//             {/* Controls */}
//             <div className="mt-5 flex flex-wrap items-center gap-2">
//               {status === "idle" && (
//                 <Button
//                   onClick={start}
//                   disabled={!canStartMain}
//                   className="min-h-10"
//                 >
//                   <Play size={15} />
//                   Start
//                 </Button>
//               )}

//               {status === "running" && (
//                 <Button onClick={pause} className="min-h-10">
//                   <Pause size={15} />
//                   Pause
//                 </Button>
//               )}

//               {status === "paused" && (
//                 <Button onClick={resume} className="min-h-10">
//                   <Play size={15} />
//                   Resume
//                 </Button>
//               )}

//               {status !== "idle" && (
//                 <Button
//                   variant="secondary"
//                   onClick={reset}
//                   className="min-h-10"
//                 >
//                   <RotateCcw size={15} />
//                   Reset
//                 </Button>
//               )}
//             </div>

//             <div className="mt-5 flex flex-wrap items-center gap-3">
//               <Button
//                 variant="secondary"
//                 onClick={saveToHistory}
//                 disabled={!canSave}
//                 className="min-h-10"
//                 title={
//                   alreadySaved
//                     ? "This exact countdown is already saved"
//                     : undefined
//                 }
//               >
//                 {justSaved || alreadySaved ? (
//                   <Check size={15} />
//                 ) : (
//                   <Save size={15} />
//                 )}
//                 {buttonLabel}
//               </Button>
//             </div>

//             <div className="mt-7 flex items-start gap-2 text-xs text-muted-foreground">
//               <Hourglass size={15} className="mt-0.5 shrink-0 text-primary" />
//               <span>
//                 Keeps counting even when the tab is in the background — the
//                 timer is derived from the clock, not a tick counter.
//               </span>
//             </div>
//           </div>

//           {/* RIGHT: result */}
//           <ResultPanel title={panelTitle}>
//             {status === "idle" ? (
//               <div className="space-y-3">
//                 <div className="grid grid-cols-4 gap-2 opacity-50">
//                   <Unit value={previewParts?.days ?? 0} label="days" />
//                   <Unit value={previewParts?.hours ?? 0} label="hrs" />
//                   <Unit value={previewParts?.minutes ?? 0} label="min" />
//                   <Unit value={previewParts?.seconds ?? 0} label="sec" />
//                 </div>
//                 <p className="text-sm leading-6 text-muted-foreground">
//                   {canStartMain
//                     ? "Press Start to begin the countdown."
//                     : useCustom
//                       ? "Enter a valid custom amount, then press Start."
//                       : "Enter a valid target date and time, then press Start."}
//                 </p>
//               </div>
//             ) : parts ? (
//               <>
//                 <div className="grid grid-cols-4 gap-2">
//                   <Unit value={parts.days} label="days" />
//                   <Unit value={parts.hours} label="hrs" />
//                   <Unit value={parts.minutes} label="min" />
//                   <Unit value={parts.seconds} label="sec" />
//                 </div>

//                 <p className="mt-3 text-sm text-muted-foreground">
//                   {parts.expired
//                     ? "Target time has passed."
//                     : summarize(parts)}
//                 </p>

//                 {parts.progress !== null && (
//                   <div className="mt-5">
//                     <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
//                       <div
//                         className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
//                         style={{ width: `${parts.progress}%` }}
//                       />
//                     </div>
//                     <p className="mt-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
//                       {parts.progress.toFixed(1)}% elapsed
//                     </p>
//                   </div>
//                 )}

//                 <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
//                   <span className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
//                     {dateInput} · {timeInput}
//                   </span>
//                   <CopyButton
//                     value={
//                       parts.expired
//                         ? "Expired"
//                         : `${parts.days}d ${parts.hours}h ${parts.minutes}m ${parts.seconds}s`
//                     }
//                   />
//                 </div>
//               </>
//             ) : (
//               <p className="text-sm leading-6 text-muted-foreground">
//                 Choose a valid target date and time, then press Start.
//               </p>
//             )}
//           </ResultPanel>
//         </div>
//       </section>
//     </div>
//   );
// }

// function Unit({ value, label }: { value: number; label: string }) {
//   return (
//     <div className="rounded-xl border border-primary/15 bg-primary/[.06] px-2 py-3 text-center">
//       <p className="ticker font-mono text-2xl font-medium leading-none tracking-[-.05em] text-foreground sm:text-3xl">
//         {String(value).padStart(2, "0")}
//       </p>
//       <p className="mt-1 font-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">
//         {label}
//       </p>
//     </div>
//   );
// }


"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  Check,
  Copy,
  Hourglass,
  Pause,
  Play,
  RotateCcw,
  Save,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-card";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { useHistory } from "@/components/history/history-context";
import {
  computeCountdown,
  CUSTOM_UNITS,
  customToMs,
  parseDateTime,
  PRESETS,
  summarize,
  toIso,
  toTime,
  type CustomUnit,
} from "./logic";

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
      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary transition hover:opacity-80"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Mode glow — one active section at a time                           */
/* ------------------------------------------------------------------ */

// Swap to ORANGE_GLOW if you prefer orange.
const BLUE_GLOW =
  "border-blue-500/40 shadow-[0_0_6px_-2px_rgba(59,130,246,.20)]";
// const ORANGE_GLOW =
//   "border-orange-500/70 shadow-[0_0_22px_-2px_rgba(249,115,22,.55)]";
const ACTIVE_GLOW = BLUE_GLOW;

type Mode = "datetime" | "preset" | "custom" | null;

function ModeBox({
  active,
  dimmed,
  onActivate,
  className = "",
  children,
}: {
  active: boolean;
  dimmed: boolean;
  onActivate: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      onPointerDownCapture={onActivate}
      onFocusCapture={onActivate}
      className={`rounded-2xl border p-3 transition-all duration-300 ${className} ${
        active
          ? ACTIVE_GLOW
          : dimmed
            ? "border-transparent opacity-40 grayscale"
            : "border-transparent"
      }`}
    >
      {children}
    </div>
  );
}

const TOOL_SLUG = "countdown";

/* Live tick — SSR-safe. Ticks 4x per second so the display changes exactly
   when a second boundary is crossed (no visible lag). */
const TICK_MS = 250;
function subscribeTick(cb: () => void) {
  const id = window.setInterval(cb, TICK_MS);
  return () => window.clearInterval(id);
}
const getTick = () => Math.floor(Date.now() / TICK_MS);
const getServerTick = () => 0;

function defaultTarget(): { date: string; time: string } {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 5);
  return { date: toIso(d), time: toTime(d) };
}

type Status = "idle" | "running" | "paused";

export function Countdown() {
  const initial = useMemo(() => defaultTarget(), []);
  const [dateInput, setDateInput] = useState(initial.date);
  const [timeInput, setTimeInput] = useState(initial.time);
  const [justSaved, setJustSaved] = useState(false);
  const { addEntry, hasSignature } = useHistory();

  // Runtime state (all timestamps are in milliseconds)
  const [status, setStatus] = useState<Status>("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [runTarget, setRunTarget] = useState<number | null>(null);

  // Duration mode: set by "5 min" style presets and by the custom input.
  const [durationMs, setDurationMs] = useState<number | null>(null);

  // Custom duration input
  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState<CustomUnit>("minutes");
  // True when the user is driving the timer from the custom box.
  const [useCustom, setUseCustom] = useState(false);

  // Which section is currently "active" (gets the glow, others dim).
  const [mode, setMode] = useState<Mode>(null);

  const tick = useSyncExternalStore(subscribeTick, getTick, getServerTick);

  // While running/paused use the real target; otherwise the form's target.
  const target = useMemo(
    () =>
      runTarget !== null
        ? new Date(runTarget)
        : parseDateTime(dateInput, timeInput),
    [runTarget, dateInput, timeInput]
  );

  // "now" depends on status.
  const now = useMemo(() => {
    if (status === "idle") return null;
    if (status === "paused" && pausedAt !== null) return new Date(pausedAt);
    if (tick === 0) return null;
    const t = tick * TICK_MS;
    // The tick can be up to 250ms old right after Start; never go before it.
    return new Date(startedAt !== null ? Math.max(t, startedAt) : t);
  }, [status, pausedAt, tick, startedAt]);

  // Origin for the progress bar — when Start was pressed.
  const origin = useMemo(
    () => (startedAt !== null ? new Date(startedAt) : null),
    [startedAt]
  );

  const parts = useMemo(
    () => (target && now ? computeCountdown(target, origin, now) : null),
    [target, now, origin]
  );

  const customMs = useMemo(
    () => customToMs(customValue, customUnit),
    [customValue, customUnit]
  );

  // What to show on the idle panel when a duration (preset or custom) is set.
  const previewMs = useCustom ? customMs : durationMs;
  const previewParts = useMemo(
    () =>
      previewMs !== null
        ? computeCountdown(new Date(previewMs), new Date(0), new Date(0))
        : null,
    [previewMs]
  );

  const customError =
    customValue.trim() !== "" && customMs === null
      ? "Enter a number greater than 0 (up to 10 years)."
      : null;

  const signature =
    durationMs !== null ? `dur:${durationMs}` : `${dateInput}|${timeInput}`;
  const alreadySaved = hasSignature(TOOL_SLUG, signature);
  const canSave = Boolean(parts) && !alreadySaved;

  /* ---------------- Mode activation ---------------- */

  // Selecting one section deselects the other two. Only when not running.
  const activate = (m: Exclude<Mode, null>) => {
    if (status !== "idle" || mode === m) return;
    setMode(m);
    if (m === "datetime") {
      setUseCustom(false);
      setDurationMs(null);
    } else if (m === "preset") {
      setUseCustom(false);
    } else {
      setUseCustom(true);
    }
  };

  /* ---------------- Controls ---------------- */

  const launch = (nowMs: number, targetMs: number, dur: number | null) => {
    setRunTarget(targetMs);
    setStartedAt(nowMs);
    setPausedAt(null);
    setDurationMs(dur);
    setStatus("running");
  };

  // One Start button for everything: custom timer, presets, or date/time.
  const start = () => {
    const nowMs = Date.now();
    if (useCustom) {
      if (customMs === null) return;
      const t = new Date(nowMs + customMs);
      setDateInput(toIso(t));
      setTimeInput(toTime(t));
      launch(nowMs, nowMs + customMs, customMs);
    } else if (durationMs !== null) {
      // Exact duration counted from this click -> starts at exactly 5:00.
      launch(nowMs, nowMs + durationMs, durationMs);
    } else if (target) {
      launch(nowMs, target.getTime(), null);
    }
  };

  const pause = () => {
    setPausedAt(Date.now());
    setStatus("paused");
  };

  const resume = () => {
    if (pausedAt !== null) {
      // Shift target and origin forward by the time spent paused, so the
      // remaining time and the progress bar both stay exactly the same.
      const delta = Date.now() - pausedAt;
      setRunTarget((t) => (t !== null ? t + delta : t));
      setStartedAt((s) => (s !== null ? s + delta : s));
    }
    setPausedAt(null);
    setStatus("running");
  };

  const clearRun = () => {
    setStatus("idle");
    setStartedAt(null);
    setPausedAt(null);
    setRunTarget(null);
  };

  const reset = () => {
    clearRun();
    setMode(null);
    setDurationMs(null);
    setUseCustom(false);
    setCustomValue("");
    const d = defaultTarget();
    setDateInput(d.date);
    setTimeInput(d.time);
  };

  const applyPreset = (label: string) => {
    const preset = PRESETS.find((p) => p.label === label);
    if (!preset) return;
    const t = preset.target(new Date());
    clearRun();
    setMode("preset");
    setUseCustom(false);
    setDurationMs(preset.durationMs ?? null);
    setDateInput(toIso(t));
    setTimeInput(toTime(t));
  };

  // User edited the date/time manually.
  const changeTarget = () => {
    clearRun();
    setMode("datetime");
    setUseCustom(false);
    setDurationMs(null);
  };

  const saveToHistory = () => {
    if (!parts || !canSave || !target) return;
    addEntry({
      tool: TOOL_SLUG,
      toolName: "Countdown",
      signature,
      summary: parts.expired
        ? "Expired"
        : `${parts.days}d ${parts.hours}h ${parts.minutes}m`,
      details: {
        Target: `${dateInput} ${timeInput}`,
        Remaining: parts.expired ? "0" : summarize(parts).replace("in ", ""),
      },
    });
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1400);
  };

  const buttonLabel = justSaved
    ? "Saved to history"
    : alreadySaved
      ? "Already in history"
      : "Save to history";

  /* Panel title */
  const panelTitle = parts?.expired
    ? "Expired"
    : status === "idle"
      ? "Ready"
      : status === "paused"
        ? "Paused"
        : "Counting down";

  const canStartMain = useCustom
    ? customMs !== null
    : durationMs !== null || Boolean(target);

  return (
    <div className="space-y-6">
      <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] lg:gap-8">
          {/* LEFT: header + form */}
          <div className="min-w-0">
            <ToolCardHeader slug={TOOL_SLUG} />

            {/* Date/time grid — ModeBox wrapped */}
            <ModeBox
              active={mode === "datetime"}
              dimmed={mode !== null && mode !== "datetime"}
              onActivate={() => activate("datetime")}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Target date"
                  type="date"
                  name="date"
                  value={dateInput}
                  disabled={status === "running"}
                  onChange={(e) => {
                    changeTarget();
                    setDateInput(e.target.value);
                  }}
                />
                <Input
                  label="Target time"
                  type="time"
                  name="time"
                  value={timeInput}
                  disabled={status === "running"}
                  onChange={(e) => {
                    changeTarget();
                    setTimeInput(e.target.value);
                  }}
                />
              </div>
            </ModeBox>

            {/* Presets — ModeBox wrapped */}
            <ModeBox
              className="mt-4"
              active={mode === "preset"}
              dimmed={mode !== null && mode !== "preset"}
              onActivate={() => activate("preset")}
            >
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                Quick set
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.label)}
                    disabled={status === "running"}
                    className="rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:opacity-40"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </ModeBox>

            {/* Custom duration — ModeBox wrapped */}
            <ModeBox
              className="mt-4"
              active={mode === "custom"}
              dimmed={mode !== null && mode !== "custom"}
              onActivate={() => activate("custom")}
            >
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                Custom timer
              </p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[110px] flex-1">
                  <Input
                    label="Amount"
                    type="number"
                    name="custom-amount"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    placeholder="e.g. 90"
                    value={customValue}
                    disabled={status !== "idle"}
                    onChange={(e) => {
                      setCustomValue(e.target.value);
                      setUseCustom(true);
                      setMode("custom");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (canStartMain) start();
                      }
                    }}
                  />
                </div>
                <select
                  aria-label="Custom timer unit"
                  value={customUnit}
                  disabled={status !== "idle"}
                  onChange={(e) => {
                    setCustomUnit(e.target.value as CustomUnit);
                    if (customValue.trim() !== "") {
                      setUseCustom(true);
                      setMode("custom");
                    }
                  }}
                  className="min-h-10 rounded-xl border border-border bg-background/60 px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary/60 disabled:opacity-40"
                >
                  {CUSTOM_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
              {customError && (
                <p className="mt-2 text-xs text-red-500">{customError}</p>
              )}
            </ModeBox>

            {/* Controls */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {status === "idle" && (
                <Button
                  onClick={start}
                  disabled={!canStartMain}
                  className="min-h-10"
                >
                  <Play size={15} />
                  Start
                </Button>
              )}

              {status === "running" && (
                <Button onClick={pause} className="min-h-10">
                  <Pause size={15} />
                  Pause
                </Button>
              )}

              {status === "paused" && (
                <Button onClick={resume} className="min-h-10">
                  <Play size={15} />
                  Resume
                </Button>
              )}

              {status !== "idle" && (
                <Button
                  variant="secondary"
                  onClick={reset}
                  className="min-h-10"
                >
                  <RotateCcw size={15} />
                  Reset
                </Button>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                onClick={saveToHistory}
                disabled={!canSave}
                className="min-h-10"
                title={
                  alreadySaved
                    ? "This exact countdown is already saved"
                    : undefined
                }
              >
                {justSaved || alreadySaved ? (
                  <Check size={15} />
                ) : (
                  <Save size={15} />
                )}
                {buttonLabel}
              </Button>
            </div>

            <div className="mt-7 flex items-start gap-2 text-xs text-muted-foreground">
              <Hourglass size={15} className="mt-0.5 shrink-0 text-primary" />
              <span>
                Keeps counting even when the tab is in the background — the
                timer is derived from the clock, not a tick counter.
              </span>
            </div>
          </div>

          {/* RIGHT: result */}
          <ResultPanel title={panelTitle}>
            {status === "idle" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 opacity-50">
                  <Unit value={previewParts?.days ?? 0} label="days" />
                  <Unit value={previewParts?.hours ?? 0} label="hrs" />
                  <Unit value={previewParts?.minutes ?? 0} label="min" />
                  <Unit value={previewParts?.seconds ?? 0} label="sec" />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {canStartMain
                    ? "Press Start to begin the countdown."
                    : useCustom
                      ? "Enter a valid custom amount, then press Start."
                      : "Enter a valid target date and time, then press Start."}
                </p>
              </div>
            ) : parts ? (
              <>
                <div className="grid grid-cols-4 gap-2">
                  <Unit value={parts.days} label="days" />
                  <Unit value={parts.hours} label="hrs" />
                  <Unit value={parts.minutes} label="min" />
                  <Unit value={parts.seconds} label="sec" />
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {parts.expired
                    ? "Target time has passed."
                    : summarize(parts)}
                </p>

                {parts.progress !== null && (
                  <div className="mt-5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                        style={{ width: `${parts.progress}%` }}
                      />
                    </div>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                      {parts.progress.toFixed(1)}% elapsed
                    </p>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                    {dateInput} · {timeInput}
                  </span>
                  <CopyButton
                    value={
                      parts.expired
                        ? "Expired"
                        : `${parts.days}d ${parts.hours}h ${parts.minutes}m ${parts.seconds}s`
                    }
                  />
                </div>
              </>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Choose a valid target date and time, then press Start.
              </p>
            )}
          </ResultPanel>
        </div>
      </section>
    </div>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-primary/15 bg-primary/[.06] px-2 py-3 text-center">
      <p className="ticker font-mono text-2xl font-medium leading-none tracking-[-.05em] text-foreground sm:text-3xl">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}