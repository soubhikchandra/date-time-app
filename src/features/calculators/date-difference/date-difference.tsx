// "use client";

// import { useMemo, useState } from "react";
// import { ArrowDownUp, Check, Copy, Save } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ResultPanel } from "@/components/ui/result-card";
// import { BreakdownCard } from "@/components/ui/breakdown-card";
// import { ToolCardHeader } from "@/components/ui/tool-card-header";
// import { useHistory } from "@/components/history/history-context";
// import { isoToday } from "@/lib/date-time";
// import { getDateDifference } from "./logic";

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
//       {copied ? "Copied" : "Copy result"}
//     </button>
//   );
// }

// const TOOL_SLUG = "date-difference";

// export function DateDifference() {
//   const [start, setStart] = useState("2024-01-15");
//   const [end, setEnd] = useState(isoToday());
//   const [justSaved, setJustSaved] = useState(false);
//   const { addEntry, hasSignature } = useHistory();

//   const diff = useMemo(
//     () => getDateDifference(start, end),
//     [start, end]
//   );

//   const signature = `${start}|${end}`;
//   const alreadySaved = hasSignature(TOOL_SLUG, signature);
//   const canSave = Boolean(diff) && !alreadySaved;

//   const saveToHistory = () => {
//     if (!diff || !canSave) return;
//     addEntry({
//       tool: TOOL_SLUG,
//       toolName: "Date Difference",
//       signature,
//       summary: `${diff.totalDays.toLocaleString()} days`,
//       details: {
//         From: start,
//         To: end,
//         "Total days": diff.totalDays.toLocaleString(),
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

//   return (
//     <div className="space-y-6">
//       <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
//         <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] lg:gap-8">
//           {/* LEFT: header + form */}
//           <div className="min-w-0">
//             <ToolCardHeader slug={TOOL_SLUG} />

//             <div className="grid gap-4 sm:grid-cols-2">
//               <Input
//                 label="Start date"
//                 type="date"
//                 name="start"
//                 value={start}
//                 onChange={(e) => setStart(e.target.value)}
//               />
//               <Input
//                 label="End date"
//                 type="date"
//                 name="end"
//                 value={end}
//                 onChange={(e) => setEnd(e.target.value)}
//               />
//             </div>

//             <div className="mt-5 flex flex-wrap items-center gap-3">
//               <Button
//                 variant="secondary"
//                 onClick={saveToHistory}
//                 disabled={!canSave}
//                 className="min-h-10"
//                 title={
//                   alreadySaved
//                     ? "This exact calculation is already saved"
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

//             <div className="mt-7 flex items-center gap-2 text-xs text-muted-foreground">
//               <ArrowDownUp size={15} className="text-primary" />
//               <span>Order is preserved — dates can run backward.</span>
//             </div>
//           </div>

//           {/* RIGHT: result */}
//           {diff ? (
//             <ResultPanel title="Difference">
//               <p className="ticker font-mono text-5xl font-medium tracking-[-.08em] text-foreground">
//                 {diff.totalDays.toLocaleString()}
//                 <span className="ml-2 text-2xl text-muted-foreground">
//                   days
//                 </span>
//               </p>
//               <p className="mt-3 text-sm text-muted-foreground">
//                 {diff.totalDays === 0
//                   ? "Both dates are the same day."
//                   : diff.reversed
//                     ? "The second date comes earlier."
//                     : "The second date comes later."}
//               </p>
//               <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
//                 <span className="text-xs text-muted-foreground">
//                   {diff.weeks.total.toLocaleString()} weeks +{" "}
//                   {diff.weeks.remainderDays} days
//                 </span>
//                 <CopyButton value={`${diff.totalDays} days`} />
//               </div>
//             </ResultPanel>
//           ) : (
//             <ResultPanel empty>
//               <p className="text-sm leading-6 text-muted-foreground">
//                 Choose two dates to measure the distance between them.
//               </p>
//             </ResultPanel>
//           )}
//         </div>
//       </section>

//       {diff && diff.totalDays > 0 && (
//         <BreakdownCard
//           title="Full breakdown"
//           rows={[
//             {
//               label: "Calendar",
//               value: `${diff.calendar.years} year${
//                 diff.calendar.years === 1 ? "" : "s"
//               }, ${diff.calendar.months} month${
//                 diff.calendar.months === 1 ? "" : "s"
//               }, ${diff.calendar.days} day${
//                 diff.calendar.days === 1 ? "" : "s"
//               }`,
//             },
//             {
//               label: "Total months",
//               value: `${diff.months.total.toLocaleString()} months and ${
//                 diff.months.remainderDays
//               } day${diff.months.remainderDays === 1 ? "" : "s"}`,
//             },
//             {
//               label: "Total weeks",
//               value: `${diff.weeks.total.toLocaleString()} weeks and ${
//                 diff.weeks.remainderDays
//               } day${diff.weeks.remainderDays === 1 ? "" : "s"}`,
//             },
//             {
//               label: "Total days",
//               value: `${diff.totalDays.toLocaleString()} days`,
//             },
//           ]}
//         />
//       )}
//     </div>
//   );
// }


"use client";

import { useMemo, useState } from "react";
import { 
  ArrowDownUp, 
  ArrowRight, 
  BarChart3, 
  Calendar, 
  CalendarDays, 
  Check, 
  Clock3, 
  Copy, 
  Hourglass, 
  Save, 
  Timer 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-card";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { useHistory } from "@/components/history/history-context";
import { isoToday } from "@/lib/date-time";
import { getDateDifference } from "./logic";

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
      {copied ? "Copied" : "Copy result"}
    </button>
  );
}

const TOOL_SLUG = "date-difference";

export function DateDifference() {
  const [start, setStart] = useState("2024-01-15");
  const [end, setEnd] = useState(isoToday());
  const [justSaved, setJustSaved] = useState(false);
  
  // NEW: State for toggling detailed view
  const [showDetailedView, setShowDetailedView] = useState(false);

  const { addEntry, hasSignature } = useHistory();

  const diff = useMemo(
    () => getDateDifference(start, end),
    [start, end]
  );

  const signature = `${start}|${end}`;
  const alreadySaved = hasSignature(TOOL_SLUG, signature);
  const canSave = Boolean(diff) && !alreadySaved;

  const saveToHistory = () => {
    if (!diff || !canSave) return;
    addEntry({
      tool: TOOL_SLUG,
      toolName: "Date Difference",
      signature,
      summary: `${diff.totalDays.toLocaleString()} days`,
      details: {
        From: start,
        To: end,
        "Total days": diff.totalDays.toLocaleString(),
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

  // Helper to calculate extra details safely for the detailed view
  const getExtraDetails = () => {
    if (!diff) return {};
    return {
      totalHours: (diff.totalDays * 24).toLocaleString(),
      totalMinutes: (diff.totalDays * 24 * 60).toLocaleString(),
      totalSeconds: (diff.totalDays * 24 * 60 * 60).toLocaleString(),
    };
  };

  const extra = getExtraDetails();

  return (
    // Changed space-y-6 to space-y-4 to match the tighter, more responsive feel
    <div className="space-y-4">
      <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] lg:gap-8">
          {/* LEFT: header + form */}
          <div className="min-w-0">
            <ToolCardHeader slug={TOOL_SLUG} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Start date"
                type="date"
                name="start"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <Input
                label="End date"
                type="date"
                name="end"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                onClick={saveToHistory}
                disabled={!canSave}
                className="min-h-10"
                title={
                  alreadySaved
                    ? "This exact calculation is already saved"
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

            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:mt-7">
              <ArrowDownUp size={15} className="shrink-0 text-primary" />
              <span>Order is preserved — dates can run backward.</span>
            </div>
          </div>

          {/* RIGHT: result */}
          {diff ? (
            <ResultPanel title="Difference">
              {/* Fluid typography applied to the big result number */}
              <p className="ticker font-mono text-[clamp(36px,8vw,48px)] font-medium tracking-[-.08em] text-foreground">
                {diff.totalDays.toLocaleString()}
                <span className="ml-2 text-[clamp(18px,4vw,24px)] text-muted-foreground">
                  days
                </span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {diff.totalDays === 0
                  ? "Both dates are the same day."
                  : diff.reversed
                    ? "The second date comes earlier."
                    : "The second date comes later."}
              </p>
              
              {/* Added flex-wrap for safe rendering on ultra-small screens */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 pt-4">
                <span className="text-xs text-muted-foreground">
                  {diff.weeks.total.toLocaleString()} weeks +{" "}
                  {diff.weeks.remainderDays} days
                </span>
                <CopyButton value={`${diff.totalDays} days`} />
              </div>
            </ResultPanel>
          ) : (
            <ResultPanel empty>
              <p className="text-sm leading-6 text-muted-foreground">
                Choose two dates to measure the distance between them.
              </p>
            </ResultPanel>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* FULL BREAKDOWN (UPDATED TO MATCH AGE BREAKDOWN STYLE)        */}
      {/* ============================================================ */}
      {diff && diff.totalDays > 0 && (
        <section
          className="rounded-[18px] p-5 sm:p-6"
          style={{
            backgroundColor: "var(--surface-card)",
            border: "1px solid var(--border-card)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Header */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-[14px] sm:size-[52px]"
                style={{
                  backgroundColor: "var(--surface-icon-breakdown)",
                  color: "var(--row-months-icon)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  className="sm:size-[22px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="10" width="4" height="10" rx="1" />
                  <rect x="10" y="6" width="4" height="14" rx="1" />
                  <rect x="17" y="3" width="4" height="17" rx="1" />
                </svg>
              </span>
              <div>
                <h2
                  className="text-[18px] font-bold tracking-[-.02em] sm:text-[20px]"
                  style={{ color: "var(--text-primary)" }}
                >
                  Full breakdown
                </h2>
                <p
                  className="mt-0.5 text-[13px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Detailed distance between the selected dates.
                </p>
              </div>
            </div>

            {/* UPDATED: Functional Detailed View Button */}
            <button
              type="button"
              onClick={() => setShowDetailedView(!showDetailedView)}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] px-4 text-[13px] font-semibold transition hover:brightness-105"
              style={{
                backgroundColor: "var(--surface-btn-secondary)",
                border: "1px solid var(--border-btn-secondary)",
                color: "var(--text-btn-secondary)",
              }}
            >
              {showDetailedView ? "Show less" : "Detailed view"}
              <ArrowRight 
                size={13} 
                style={{ 
                  color: "var(--purple)",
                  transform: showDetailedView ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease"
                }} 
              />
            </button>
          </div>

          {/* Rows */}
          <ul className="space-y-1.5">
            {[
              {
                label: "Calendar",
                value: `${diff.calendar.years} year${
                  diff.calendar.years === 1 ? "" : "s"
                }, ${diff.calendar.months} month${
                  diff.calendar.months === 1 ? "" : "s"
                }, ${diff.calendar.days} day${
                  diff.calendar.days === 1 ? "" : "s"
                }`,
                bg: "var(--row-months-bg)",
                icon: "var(--row-months-icon)",
                text: "var(--row-months-text)",
                Icon: Calendar,
              },
              {
                label: "Total months",
                value: `${diff.months.total.toLocaleString()} months and ${
                  diff.months.remainderDays
                } day${diff.months.remainderDays === 1 ? "" : "s"}`,
                bg: "var(--row-weeks-bg)",
                icon: "var(--row-weeks-icon)",
                text: "var(--row-weeks-text)",
                Icon: Clock3,
              },
              {
                label: "Total weeks",
                value: `${diff.weeks.total.toLocaleString()} weeks and ${
                  diff.weeks.remainderDays
                } day${diff.weeks.remainderDays === 1 ? "" : "s"}`,
                bg: "var(--row-days-bg)",
                icon: "var(--row-days-icon)",
                text: "var(--row-days-text)",
                Icon: CalendarDays,
              },
              {
                label: "Total days",
                value: `${diff.totalDays.toLocaleString()} days`,
                bg: "var(--row-months-bg)",
                icon: "var(--row-months-icon)",
                text: "var(--row-months-text)",
                Icon: BarChart3,
              },
              // CONDITIONAL EXTRA ROWS FOR DETAILED VIEW
              ...(showDetailedView ? [
                {
                  label: "Total hours",
                  value: `${extra.totalHours} hours`,
                  bg: "var(--row-weeks-bg)",
                  icon: "var(--row-weeks-icon)",
                  text: "var(--row-weeks-text)",
                  Icon: Timer,
                },
                {
                  label: "Total minutes",
                  value: `${extra.totalMinutes} minutes`,
                  bg: "var(--row-days-bg)",
                  icon: "var(--row-days-icon)",
                  text: "var(--row-days-text)",
                  Icon: Hourglass,
                },
                {
                  label: "Total seconds",
                  value: `${extra.totalSeconds} seconds`,
                  bg: "var(--row-months-bg)",
                  icon: "var(--row-months-icon)",
                  text: "var(--row-months-text)",
                  Icon: Clock3,
                }
              ] : [])
            ].map((row) => {
              const Icon = row.Icon;
              return (
                <li
                  key={row.label}
                  className="flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[10px] px-3 py-2"
                  style={{ backgroundColor: row.bg }}
                >
                  <span
                    className="grid size-6 shrink-0 place-items-center rounded-full"
                    style={{
                      backgroundColor: "var(--surface-card)",
                      color: row.icon,
                    }}
                  >
                    <Icon size={12} />
                  </span>
                  
                  <span
                    className="shrink-0 text-[13px] font-semibold sm:text-[14px]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {row.label}
                  </span>
                  
                  <span
                    className="min-w-0 flex-1 text-right text-[13px] font-medium sm:text-left sm:text-[14px]"
                    style={{ color: row.text }}
                  >
                    {row.value}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}