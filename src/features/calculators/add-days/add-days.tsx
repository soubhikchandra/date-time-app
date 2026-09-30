// "use client";

// import { useMemo, useState } from "react";
// import { CalendarPlus, Check, Copy, Save } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ResultPanel } from "@/components/ui/result-card";
// import { BreakdownCard } from "@/components/ui/breakdown-card";
// import { ToolCardHeader } from "@/components/ui/tool-card-header";
// import { useHistory } from "@/components/history/history-context";
// import { dateLabel, isoToday } from "@/lib/date-time";
// import { getAddDays } from "./logic";

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

// const TOOL_SLUG = "add-days";

// export function AddDays() {
//   const [date, setDate] = useState(isoToday());
//   const [amount, setAmount] = useState("30");
//   const [justSaved, setJustSaved] = useState(false);
//   const { addEntry, hasSignature } = useHistory();

//   const result = useMemo(() => getAddDays(date, amount), [date, amount]);

//   const signature = `${date}|${amount}`;
//   const alreadySaved = hasSignature(TOOL_SLUG, signature);
//   const canSave = Boolean(result) && !alreadySaved;
//   const invalid = date && amount.trim() !== "" && !result;

//   const saveToHistory = () => {
//     if (!result || !canSave) return;
//     const summary = dateLabel(result.result, {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//     addEntry({
//       tool: TOOL_SLUG,
//       toolName: "Add Days",
//       signature,
//       summary,
//       details: {
//         From: date,
//         Days: amount,
//         Result: summary,
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

//             <div className="grid gap-4 sm:grid-cols-[1fr_150px] sm:items-end">
//               <Input
//                 label="Starting date"
//                 type="date"
//                 name="date"
//                 value={date}
//                 onChange={(e) => setDate(e.target.value)}
//               />
//               <Input
//                 label="Days to add"
//                 type="number"
//                 name="amount"
//                 min={0}
//                 step={1}
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
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

//             {invalid && (
//               <p className="mt-4 text-sm font-semibold text-destructive">
//                 Enter a whole number of days between 0 and 100,000.
//               </p>
//             )}

//             <div className="mt-7 flex items-center gap-2 text-xs text-muted-foreground">
//               <CalendarPlus size={15} className="text-primary" />
//               <span>
//                 Moves forward from the starting date — weekends included.
//               </span>
//             </div>
//           </div>

//           {/* RIGHT: result */}
//           {result ? (
//             <ResultPanel title="New date">
//               <p className="ticker font-mono text-3xl font-medium tracking-[-.06em] text-foreground sm:text-4xl">
//                 {dateLabel(result.result, {
//                   weekday: "short",
//                   month: "short",
//                   day: "numeric",
//                 })}
//               </p>
//               <p className="mt-2 text-sm text-muted-foreground">
//                 {dateLabel(result.result, { year: "numeric" })}
//               </p>
//               <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
//                 <span className="text-xs text-muted-foreground">
//                   +{result.amount.toLocaleString()} day
//                   {result.amount === 1 ? "" : "s"}
//                 </span>
//                 <CopyButton value={result.result.toISOString().slice(0, 10)} />
//               </div>
//             </ResultPanel>
//           ) : (
//             <ResultPanel empty>
//               <p className="text-sm leading-6 text-muted-foreground">
//                 Enter a starting date and a number of days to jump forward.
//               </p>
//             </ResultPanel>
//           )}
//         </div>
//       </section>

//       {result && result.amount > 0 && (
//         <BreakdownCard
//           title="Details"
//           rows={[
//             {
//               label: "Starting date",
//               value: dateLabel(result.from, {
//                 weekday: "long",
//                 month: "long",
//                 day: "numeric",
//                 year: "numeric",
//               }),
//             },
//             {
//               label: "Days added",
//               value: `${result.amount.toLocaleString()} day${
//                 result.amount === 1 ? "" : "s"
//               }`,
//             },
//             {
//               label: "Resulting date",
//               value: dateLabel(result.result, {
//                 weekday: "long",
//                 month: "long",
//                 day: "numeric",
//                 year: "numeric",
//               }),
//             },
//             {
//               label: "Weeks spanned",
//               value: `${Math.floor(result.amount / 7)} week${
//                 Math.floor(result.amount / 7) === 1 ? "" : "s"
//               } + ${result.amount % 7} day${
//                 result.amount % 7 === 1 ? "" : "s"
//               }`,
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
  ArrowRight, 
  BarChart3, 
  Calendar, 
  CalendarDays, 
  CalendarPlus, 
  Check, 
  Clock3, 
  Copy, 
  Save 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-card";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { useHistory } from "@/components/history/history-context";
import { dateLabel, isoToday } from "@/lib/date-time";
import { getAddDays } from "./logic";

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

const TOOL_SLUG = "add-days";

export function AddDays() {
  const [date, setDate] = useState(isoToday());
  const [amount, setAmount] = useState("30");
  const [justSaved, setJustSaved] = useState(false);
  
  // NEW: State for toggling detailed view
  const [showDetailedView, setShowDetailedView] = useState(false);

  const { addEntry, hasSignature } = useHistory();

  const result = useMemo(() => getAddDays(date, amount), [date, amount]);

  const signature = `${date}|${amount}`;
  const alreadySaved = hasSignature(TOOL_SLUG, signature);
  const canSave = Boolean(result) && !alreadySaved;
  const invalid = date && amount.trim() !== "" && !result;

  const saveToHistory = () => {
    if (!result || !canSave) return;
    const summary = dateLabel(result.result, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    addEntry({
      tool: TOOL_SLUG,
      toolName: "Add Days",
      signature,
      summary,
      details: {
        From: date,
        Days: amount,
        Result: summary,
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

  // Helper to calculate extra details safely
  const getExtraDetails = () => {
    if (!result) return {};
    const d = result.result;
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    const totalDaysInYear = (d.getFullYear() % 4 === 0 && d.getFullYear() % 100 !== 0) || (d.getFullYear() % 400 === 0) ? 366 : 365;
    
    return {
      dayOfYear: `${dayOfYear} of ${totalDaysInYear}`,
      weekNumber: `Week ${Math.ceil(dayOfYear / 7)}`,
      unix: Math.floor(d.getTime() / 1000).toLocaleString(),
      iso: d.toISOString().slice(0, 10),
    };
  };

  const extra = getExtraDetails();

  return (
    <div className="space-y-4">
      <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] lg:gap-8">
          {/* LEFT: header + form */}
          <div className="min-w-0">
            <ToolCardHeader slug={TOOL_SLUG} />

            <div className="grid gap-4 sm:grid-cols-[1fr_130px] sm:items-end">
              <Input
                label="Starting date"
                type="date"
                name="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                label="Days to add"
                type="number"
                name="amount"
                min={0}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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

            {invalid && (
              <p className="mt-4 text-sm font-semibold text-destructive">
                Enter a whole number of days between 0 and 100,000.
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:mt-7">
              <CalendarPlus size={15} className="text-primary shrink-0" />
              <span>
                Moves forward from the starting date — weekends included.
              </span>
            </div>
          </div>

          {/* RIGHT: result */}
          {result ? (
            <ResultPanel title="New date">
              <p className="ticker font-mono text-[clamp(24px,6vw,36px)] font-medium tracking-[-.06em] text-foreground">
                {dateLabel(result.result, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {dateLabel(result.result, { year: "numeric" })}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 pt-4">
                <span className="text-xs text-muted-foreground">
                  +{result.amount.toLocaleString()} day
                  {result.amount === 1 ? "" : "s"}
                </span>
                <CopyButton value={result.result.toISOString().slice(0, 10)} />
              </div>
            </ResultPanel>
          ) : (
            <ResultPanel empty>
              <p className="text-sm leading-6 text-muted-foreground">
                Enter a starting date and a number of days to jump forward.
              </p>
            </ResultPanel>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* DETAILS BREAKDOWN                                            */}
      {/* ============================================================ */}
      {result && result.amount > 0 && (
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
                  Details
                </h2>
                <p
                  className="mt-0.5 text-[13px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Breakdown of the date calculation.
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
                label: "Starting date",
                value: dateLabel(result.from, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
                bg: "var(--row-months-bg)",
                icon: "var(--row-months-icon)",
                text: "var(--row-months-text)",
                Icon: Calendar,
              },
              {
                label: "Days added",
                value: `${result.amount.toLocaleString()} day${
                  result.amount === 1 ? "" : "s"
                }`,
                bg: "var(--row-weeks-bg)",
                icon: "var(--row-weeks-icon)",
                text: "var(--row-weeks-text)",
                Icon: Clock3,
              },
              {
                label: "Resulting date",
                value: dateLabel(result.result, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
                bg: "var(--row-days-bg)",
                icon: "var(--row-days-icon)",
                text: "var(--row-days-text)",
                Icon: CalendarDays,
              },
              {
                label: "Weeks spanned",
                value: `${Math.floor(result.amount / 7)} week${
                  Math.floor(result.amount / 7) === 1 ? "" : "s"
                } + ${result.amount % 7} day${
                  result.amount % 7 === 1 ? "" : "s"
                }`,
                bg: "var(--row-months-bg)",
                icon: "var(--row-months-icon)",
                text: "var(--row-months-text)",
                Icon: BarChart3,
              },
              // CONDITIONAL EXTRA ROWS
              ...(showDetailedView ? [
                {
                  label: "Day of the year",
                  value: extra.dayOfYear,
                  bg: "var(--row-weeks-bg)",
                  icon: "var(--row-weeks-icon)",
                  text: "var(--row-weeks-text)",
                  Icon: CalendarDays,
                },
                {
                  label: "Week number",
                  value: extra.weekNumber,
                  bg: "var(--row-days-bg)",
                  icon: "var(--row-days-icon)",
                  text: "var(--row-days-text)",
                  Icon: Clock3,
                },
                {
                  label: "Unix timestamp",
                  value: extra.unix,
                  bg: "var(--row-months-bg)",
                  icon: "var(--row-months-icon)",
                  text: "var(--row-months-text)",
                  Icon: BarChart3,
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