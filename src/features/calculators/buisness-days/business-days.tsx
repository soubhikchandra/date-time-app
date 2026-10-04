// // "use client";

// // import { useMemo, useState } from "react";
// // import { BriefcaseBusiness, Check, Copy, Plus, Save, X } from "lucide-react";
// // import { Input } from "@/components/ui/input";
// // import { Button } from "@/components/ui/button";
// // import { ResultPanel } from "@/components/ui/result-card";
// // import { BreakdownCard } from "@/components/ui/breakdown-card";
// // import { ToolCardHeader } from "@/components/ui/tool-card-header";
// // import { useHistory } from "@/components/history/history-context";
// // import { dateLabel, isoToday } from "@/lib/date-time";
// // import { getBusinessDays } from "./logic";

// // function CopyButton({ value }: { value: string }) {
// //   const [copied, setCopied] = useState(false);
// //   const copy = async () => {
// //     try {
// //       await navigator.clipboard.writeText(value);
// //       setCopied(true);
// //       window.setTimeout(() => setCopied(false), 1400);
// //     } catch {
// //       /* clipboard blocked */
// //     }
// //   };
// //   return (
// //     <button
// //       type="button"
// //       onClick={copy}
// //       className="inline-flex items-center gap-1.5 text-xs font-bold text-primary transition hover:opacity-80"
// //     >
// //       {copied ? <Check size={13} /> : <Copy size={13} />}
// //       {copied ? "Copied" : "Copy result"}
// //     </button>
// //   );
// // }

// // const TOOL_SLUG = "business-days";

// // export function BusinessDays() {
// //   const [start, setStart] = useState(isoToday());
// //   const [end, setEnd] = useState("");
// //   const [holidays, setHolidays] = useState<string[]>([]);
// //   const [holidayInput, setHolidayInput] = useState("");
// //   const [justSaved, setJustSaved] = useState(false);
// //   const { addEntry, hasSignature } = useHistory();

// //   // Default end = 30 days from today
// //   if (!end) {
// //     const d = new Date();
// //     d.setDate(d.getDate() + 30);
// //     setEnd(d.toISOString().slice(0, 10));
// //   }

// //   const result = useMemo(
// //     () => getBusinessDays(start, end, holidays),
// //     [start, end, holidays]
// //   );

// //   const signature = `${start}|${end}|${holidays.join(",")}`;
// //   const alreadySaved = hasSignature(TOOL_SLUG, signature);
// //   const canSave = Boolean(result) && !alreadySaved;

// //   const addHoliday = () => {
// //     if (!holidayInput) return;
// //     if (holidays.includes(holidayInput)) {
// //       setHolidayInput("");
// //       return;
// //     }
// //     setHolidays([...holidays, holidayInput].sort());
// //     setHolidayInput("");
// //   };

// //   const removeHoliday = (value: string) => {
// //     setHolidays(holidays.filter((h) => h !== value));
// //   };

// //   const saveToHistory = () => {
// //     if (!result || !canSave) return;
// //     addEntry({
// //       tool: TOOL_SLUG,
// //       toolName: "Business Days",
// //       signature,
// //       summary: `${result.total} workdays`,
// //       details: {
// //         From: start,
// //         To: end,
// //         Workdays: String(result.total),
// //         Weekends: String(result.weekends),
// //         Holidays: String(result.holidaysApplied),
// //       },
// //     });
// //     setJustSaved(true);
// //     window.setTimeout(() => setJustSaved(false), 1400);
// //   };

// //   const buttonLabel = justSaved
// //     ? "Saved to history"
// //     : alreadySaved
// //       ? "Already in history"
// //       : "Save to history";

// //   return (
// //     <div className="space-y-6">
// //       <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
// //         <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] lg:gap-8">
// //           {/* LEFT: header + form */}
// //           <div className="min-w-0">
// //             <ToolCardHeader slug={TOOL_SLUG} />

// //             <div className="grid gap-4 sm:grid-cols-2">
// //               <Input
// //                 label="Start date"
// //                 type="date"
// //                 name="start"
// //                 value={start}
// //                 onChange={(e) => setStart(e.target.value)}
// //               />
// //               <Input
// //                 label="End date"
// //                 type="date"
// //                 name="end"
// //                 value={end}
// //                 onChange={(e) => setEnd(e.target.value)}
// //               />
// //             </div>

// //             {/* Holidays */}
// //             <div className="mt-5">
// //               <p className="mb-2 text-sm font-bold text-foreground">
// //                 Holidays{" "}
// //                 <span className="font-normal text-muted-foreground">
// //                   (optional)
// //                 </span>
// //               </p>
// //               <div className="flex gap-2">
// //                 <Input
// //                   type="date"
// //                   name="holiday"
// //                   value={holidayInput}
// //                   onChange={(e) => setHolidayInput(e.target.value)}
// //                 />
// //                 <Button
// //                   variant="secondary"
// //                   onClick={addHoliday}
// //                   disabled={!holidayInput}
// //                   className="shrink-0 px-3"
// //                   aria-label="Add holiday"
// //                 >
// //                   <Plus size={15} />
// //                 </Button>
// //               </div>

// //               {holidays.length > 0 && (
// //                 <ul className="mt-3 flex flex-wrap gap-2">
// //                   {holidays.map((h) => (
// //                     <li
// //                       key={h}
// //                       className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-1 font-mono text-xs text-foreground"
// //                     >
// //                       {h}
// //                       <button
// //                         type="button"
// //                         onClick={() => removeHoliday(h)}
// //                         aria-label={`Remove ${h}`}
// //                         className="grid size-4 place-items-center rounded text-muted-foreground transition hover:text-destructive"
// //                       >
// //                         <X size={11} />
// //                       </button>
// //                     </li>
// //                   ))}
// //                 </ul>
// //               )}
// //             </div>

// //             <div className="mt-5 flex flex-wrap items-center gap-3">
// //               <Button
// //                 variant="secondary"
// //                 onClick={saveToHistory}
// //                 disabled={!canSave}
// //                 className="min-h-10"
// //                 title={
// //                   alreadySaved
// //                     ? "This exact calculation is already saved"
// //                     : undefined
// //                 }
// //               >
// //                 {justSaved || alreadySaved ? (
// //                   <Check size={15} />
// //                 ) : (
// //                   <Save size={15} />
// //                 )}
// //                 {buttonLabel}
// //               </Button>
// //             </div>

// //             <div className="mt-7 flex items-start gap-2 text-xs text-muted-foreground">
// //               <BriefcaseBusiness size={15} className="mt-0.5 shrink-0 text-primary" />
// //               <span>
// //                 Weekends are excluded automatically. Both endpoints count if
// //                 they fall on a weekday.
// //               </span>
// //             </div>
// //           </div>

// //           {/* RIGHT: result */}
// //           {result ? (
// //             <ResultPanel title="Business days">
// //               <p className="ticker font-mono text-5xl font-medium tracking-[-.08em] text-foreground">
// //                 {result.total.toLocaleString()}
// //                 <span className="ml-2 text-2xl text-muted-foreground">
// //                   days
// //                 </span>
// //               </p>
// //               <p className="mt-3 text-sm text-muted-foreground">
// //                 {result.reversed
// //                   ? "Range runs backward — order preserved."
// //                   : "Monday through Friday, holidays removed."}
// //               </p>
// //               <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
// //                 <span className="text-xs text-muted-foreground">
// //                   {result.weekends} weekend day
// //                   {result.weekends === 1 ? "" : "s"} skipped
// //                 </span>
// //                 <CopyButton value={`${result.total} business days`} />
// //               </div>
// //             </ResultPanel>
// //           ) : (
// //             <ResultPanel empty>
// //               <p className="text-sm leading-6 text-muted-foreground">
// //                 Pick two dates to count the weekdays inside them.
// //               </p>
// //             </ResultPanel>
// //           )}
// //         </div>
// //       </section>

// //       {result && (
// //         <BreakdownCard
// //           title="Details"
// //           rows={[
// //             {
// //               label: "Start",
// //               value: dateLabel(result.start, {
// //                 weekday: "short",
// //                 month: "short",
// //                 day: "numeric",
// //                 year: "numeric",
// //               }),
// //             },
// //             {
// //               label: "End",
// //               value: dateLabel(result.end, {
// //                 weekday: "short",
// //                 month: "short",
// //                 day: "numeric",
// //                 year: "numeric",
// //               }),
// //             },
// //             {
// //               label: "Calendar days",
// //               value: `${result.calendarDays.toLocaleString()} days`,
// //             },
// //             {
// //               label: "Weekend days",
// //               value: `${result.weekends.toLocaleString()} days`,
// //             },
// //             {
// //               label: "Holidays applied",
// //               value: `${result.holidaysApplied.toLocaleString()}`,
// //             },
// //             {
// //               label: "Business days",
// //               value: `${result.total.toLocaleString()} days`,
// //             },
// //           ]}
// //         />
// //       )}
// //     </div>
// //   );
// // }

// "use client";

// import { useMemo, useState } from "react";
// import { 
//   ArrowRight, 
//   BarChart3, 
//   BriefcaseBusiness, 
//   Calendar, 
//   CalendarDays, 
//   Check, 
//   Clock3, 
//   Copy, 
//   Plus, 
//   Save, 
//   X 
// } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ResultPanel } from "@/components/ui/result-card";
// import { ToolCardHeader } from "@/components/ui/tool-card-header";
// import { useHistory } from "@/components/history/history-context";
// import { dateLabel, isoToday } from "@/lib/date-time";
// import { getBusinessDays } from "./logic";

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

// const TOOL_SLUG = "business-days";

// export function BusinessDays() {
//   const [start, setStart] = useState(isoToday());
//   const [end, setEnd] = useState("");
//   const [holidays, setHolidays] = useState<string[]>([]);
//   const [holidayInput, setHolidayInput] = useState("");
//   const [justSaved, setJustSaved] = useState(false);
  
//   // NEW: State for toggling detailed view
//   const [showDetailedView, setShowDetailedView] = useState(false);

//   const { addEntry, hasSignature } = useHistory();

//   // Default end = 30 days from today
//   if (!end) {
//     const d = new Date();
//     d.setDate(d.getDate() + 30);
//     setEnd(d.toISOString().slice(0, 10));
//   }

//   const result = useMemo(
//     () => getBusinessDays(start, end, holidays),
//     [start, end, holidays]
//   );

//   const signature = `${start}|${end}|${holidays.join(",")}`;
//   const alreadySaved = hasSignature(TOOL_SLUG, signature);
//   const canSave = Boolean(result) && !alreadySaved;

//   const addHoliday = () => {
//     if (!holidayInput) return;
//     if (holidays.includes(holidayInput)) {
//       setHolidayInput("");
//       return;
//     }
//     setHolidays([...holidays, holidayInput].sort());
//     setHolidayInput("");
//   };

//   const removeHoliday = (value: string) => {
//     setHolidays(holidays.filter((h) => h !== value));
//   };

//   const saveToHistory = () => {
//     if (!result || !canSave) return;
//     addEntry({
//       tool: TOOL_SLUG,
//       toolName: "Business Days",
//       signature,
//       summary: `${result.total} workdays`,
//       details: {
//         From: start,
//         To: end,
//         Workdays: String(result.total),
//         Weekends: String(result.weekends),
//         Holidays: String(result.holidaysApplied),
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

//   // Helper to calculate extra details safely for the detailed view
//   const getExtraDetails = () => {
//     if (!result) return {};
//     const s = result.start;
//     const e = result.end;
    
//     // Calculate months spanned roughly
//     const monthsSpanned = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    
//     // Calculate weeks spanned
//     const weeksSpanned = Math.ceil(result.calendarDays / 7);
    
//     // Average business days per week
//     const avgPerWeek = weeksSpanned > 0 ? (result.total / weeksSpanned).toFixed(1) : "0.0";

//     return {
//       monthsSpanned,
//       weeksSpanned,
//       avgPerWeek,
//     };
//   };

//   const extra = getExtraDetails();

//   return (
//     <div className="space-y-4">
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

//             {/* Holidays */}
//             <div className="mt-5">
//               <p className="mb-2 text-sm font-bold text-foreground">
//                 Holidays{" "}
//                 <span className="font-normal text-muted-foreground">
//                   (optional)
//                 </span>
//               </p>
//               <div className="flex gap-2">
//                 <Input
//                   type="date"
//                   name="holiday"
//                   value={holidayInput}
//                   onChange={(e) => setHolidayInput(e.target.value)}
//                 />
//                 <Button
//                   variant="secondary"
//                   onClick={addHoliday}
//                   disabled={!holidayInput}
//                   className="shrink-0 px-3"
//                   aria-label="Add holiday"
//                 >
//                   <Plus size={15} />
//                 </Button>
//               </div>

//               {holidays.length > 0 && (
//                 <ul className="mt-3 flex flex-wrap gap-2">
//                   {holidays.map((h) => (
//                     <li
//                       key={h}
//                       className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-1 font-mono text-xs text-foreground"
//                     >
//                       {h}
//                       <button
//                         type="button"
//                         onClick={() => removeHoliday(h)}
//                         aria-label={`Remove ${h}`}
//                         className="grid size-4 place-items-center rounded text-muted-foreground transition hover:text-destructive"
//                       >
//                         <X size={11} />
//                       </button>
//                     </li>
//                   ))}
//                 </ul>
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

//             <div className="mt-6 flex flex-wrap items-start gap-2 text-xs text-muted-foreground sm:mt-7">
//               <BriefcaseBusiness size={15} className="mt-0.5 shrink-0 text-primary" />
//               <span>
//                 Weekends are excluded automatically. Both endpoints count if
//                 they fall on a weekday.
//               </span>
//             </div>
//           </div>

//           {/* RIGHT: result */}
//           {result ? (
//             <ResultPanel title="Business days">
//               {/* Fluid typography applied to the big result number */}
//               <p className="ticker font-mono text-[clamp(36px,8vw,48px)] font-medium tracking-[-.08em] text-foreground">
//                 {result.total.toLocaleString()}
//                 <span className="ml-2 text-[clamp(18px,4vw,24px)] text-muted-foreground">
//                   days
//                 </span>
//               </p>
//               <p className="mt-3 text-sm text-muted-foreground">
//                 {result.reversed
//                   ? "Range runs backward — order preserved."
//                   : "Monday through Friday, holidays removed."}
//               </p>
              
//               {/* Added flex-wrap for safe rendering on ultra-small screens */}
//               <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 pt-4">
//                 <span className="text-xs text-muted-foreground">
//                   {result.weekends} weekend day
//                   {result.weekends === 1 ? "" : "s"} skipped
//                 </span>
//                 <CopyButton value={`${result.total} business days`} />
//               </div>
//             </ResultPanel>
//           ) : (
//             <ResultPanel empty>
//               <p className="text-sm leading-6 text-muted-foreground">
//                 Pick two dates to count the weekdays inside them.
//               </p>
//             </ResultPanel>
//           )}
//         </div>
//       </section>

//       {/* ============================================================ */}
//       {/* DETAILS BREAKDOWN (UPDATED TO MATCH AGE BREAKDOWN STYLE)     */}
//       {/* ============================================================ */}
//       {result && (
//         <section
//           className="rounded-[18px] p-5 sm:p-6"
//           style={{
//             backgroundColor: "var(--surface-card)",
//             border: "1px solid var(--border-card)",
//             boxShadow: "var(--shadow-card)",
//           }}
//         >
//           {/* Header */}
//           <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
//             <div className="flex items-start gap-3">
//               <span
//                 className="grid size-11 shrink-0 place-items-center rounded-[14px] sm:size-[52px]"
//                 style={{
//                   backgroundColor: "var(--surface-icon-breakdown)",
//                   color: "var(--row-months-icon)",
//                 }}
//               >
//                 <svg
//                   width="20"
//                   height="20"
//                   className="sm:size-[22px]"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <rect x="3" y="10" width="4" height="10" rx="1" />
//                   <rect x="10" y="6" width="4" height="14" rx="1" />
//                   <rect x="17" y="3" width="4" height="17" rx="1" />
//                 </svg>
//               </span>
//               <div>
//                 <h2
//                   className="text-[18px] font-bold tracking-[-.02em] sm:text-[20px]"
//                   style={{ color: "var(--text-primary)" }}
//                 >
//                   Details
//                 </h2>
//                 <p
//                   className="mt-0.5 text-[13px]"
//                   style={{ color: "var(--text-muted)" }}
//                 >
//                   Breakdown of the business days calculation.
//                 </p>
//               </div>
//             </div>

//             {/* UPDATED: Functional Detailed View Button */}
//             <button
//               type="button"
//               onClick={() => setShowDetailedView(!showDetailedView)}
//               className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] px-4 text-[13px] font-semibold transition hover:brightness-105"
//               style={{
//                 backgroundColor: "var(--surface-btn-secondary)",
//                 border: "1px solid var(--border-btn-secondary)",
//                 color: "var(--text-btn-secondary)",
//               }}
//             >
//               {showDetailedView ? "Show less" : "Detailed view"}
//               <ArrowRight 
//                 size={13} 
//                 style={{ 
//                   color: "var(--purple)",
//                   transform: showDetailedView ? "rotate(90deg)" : "rotate(0deg)",
//                   transition: "transform 0.2s ease"
//                 }} 
//               />
//             </button>
//           </div>

//           {/* Rows */}
//           <ul className="space-y-1.5">
//             {[
//               {
//                 label: "Start date",
//                 value: dateLabel(result.start, {
//                   weekday: "long",
//                   month: "long",
//                   day: "numeric",
//                   year: "numeric",
//                 }),
//                 bg: "var(--row-months-bg)",
//                 icon: "var(--row-months-icon)",
//                 text: "var(--row-months-text)",
//                 Icon: Calendar,
//               },
//               {
//                 label: "End date",
//                 value: dateLabel(result.end, {
//                   weekday: "long",
//                   month: "long",
//                   day: "numeric",
//                   year: "numeric",
//                 }),
//                 bg: "var(--row-weeks-bg)",
//                 icon: "var(--row-weeks-icon)",
//                 text: "var(--row-weeks-text)",
//                 Icon: CalendarDays,
//               },
//               {
//                 label: "Calendar days",
//                 value: `${result.calendarDays.toLocaleString()} days`,
//                 bg: "var(--row-days-bg)",
//                 icon: "var(--row-days-icon)",
//                 text: "var(--row-days-text)",
//                 Icon: Clock3,
//               },
//               {
//                 label: "Weekend days",
//                 value: `${result.weekends.toLocaleString()} days`,
//                 bg: "var(--row-months-bg)",
//                 icon: "var(--row-months-icon)",
//                 text: "var(--row-months-text)",
//                 Icon: CalendarDays,
//               },
//               {
//                 label: "Holidays applied",
//                 value: `${result.holidaysApplied.toLocaleString()}`,
//                 bg: "var(--row-weeks-bg)",
//                 icon: "var(--row-weeks-icon)",
//                 text: "var(--row-weeks-text)",
//                 Icon: Calendar,
//               },
//               {
//                 label: "Business days",
//                 value: `${result.total.toLocaleString()} days`,
//                 bg: "var(--row-days-bg)",
//                 icon: "var(--row-days-icon)",
//                 text: "var(--row-days-text)",
//                 Icon: BriefcaseBusiness,
//               },
//               // CONDITIONAL EXTRA ROWS FOR DETAILED VIEW
//               ...(showDetailedView ? [
//                 {
//                   label: "Weeks spanned",
//                   value: `${extra.weeksSpanned} weeks`,
//                   bg: "var(--row-months-bg)",
//                   icon: "var(--row-months-icon)",
//                   text: "var(--row-months-text)",
//                   Icon: BarChart3,
//                 },
//                 {
//                   label: "Months spanned",
//                   value: `${extra.monthsSpanned} months`,
//                   bg: "var(--row-weeks-bg)",
//                   icon: "var(--row-weeks-icon)",
//                   text: "var(--row-weeks-text)",
//                   Icon: CalendarDays,
//                 },
//                 {
//                   label: "Avg business days / week",
//                   value: `${extra.avgPerWeek} days`,
//                   bg: "var(--row-days-bg)",
//                   icon: "var(--row-days-icon)",
//                   text: "var(--row-days-text)",
//                   Icon: Clock3,
//                 }
//               ] : [])
//             ].map((row) => {
//               const Icon = row.Icon;
//               return (
//                 <li
//                   key={row.label}
//                   className="flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[10px] px-3 py-2"
//                   style={{ backgroundColor: row.bg }}
//                 >
//                   <span
//                     className="grid size-6 shrink-0 place-items-center rounded-full"
//                     style={{
//                       backgroundColor: "var(--surface-card)",
//                       color: row.icon,
//                     }}
//                   >
//                     <Icon size={12} />
//                   </span>
                  
//                   <span
//                     className="shrink-0 text-[13px] font-semibold sm:text-[14px]"
//                     style={{ color: "var(--text-primary)" }}
//                   >
//                     {row.label}
//                   </span>
                  
//                   <span
//                     className="min-w-0 flex-1 text-right text-[13px] font-medium sm:text-left sm:text-[14px]"
//                     style={{ color: row.text }}
//                   >
//                     {row.value}
//                   </span>
//                 </li>
//               );
//             })}
//           </ul>
//         </section>
//       )}
//     </div>
//   );
// }

"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Plus,
  Save,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-card";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { useHistory } from "@/components/history/history-context";
import { dateLabel, isoToday } from "@/lib/date-time";
import { getBusinessDays } from "./logic";

/* ------------------------------------------------------------------ */
/*  Select-only date input helpers                                     */
/*  Blocks typing & pasting; opens the browser's date picker on click  */
/* ------------------------------------------------------------------ */

const ALLOWED_KEYS = new Set([
  "Tab",
  "Enter",
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

function handleDateKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (!ALLOWED_KEYS.has(e.key)) {
    e.preventDefault();
  }
}

function handleDateClick(e: React.MouseEvent<HTMLInputElement>) {
  const el = e.currentTarget as HTMLInputElement & {
    showPicker?: () => void;
  };
  try {
    el.showPicker?.();
  } catch {
    /* ignore */
  }
}

function handleDatePaste(e: React.ClipboardEvent<HTMLInputElement>) {
  e.preventDefault();
}

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

const TOOL_SLUG = "business-days";

export function BusinessDays() {
  const [start, setStart] = useState(isoToday());
  const [end, setEnd] = useState("");
  const [holidays, setHolidays] = useState<string[]>([]);
  const [holidayInput, setHolidayInput] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  // NEW: State for toggling detailed view
  const [showDetailedView, setShowDetailedView] = useState(false);

  const { addEntry, hasSignature } = useHistory();

  // Default end = 30 days from today
  if (!end) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setEnd(d.toISOString().slice(0, 10));
  }

  const result = useMemo(
    () => getBusinessDays(start, end, holidays),
    [start, end, holidays]
  );

  const signature = `${start}|${end}|${holidays.join(",")}`;
  const alreadySaved = hasSignature(TOOL_SLUG, signature);
  const canSave = Boolean(result) && !alreadySaved;

  const addHoliday = () => {
    if (!holidayInput) return;
    if (holidays.includes(holidayInput)) {
      setHolidayInput("");
      return;
    }
    setHolidays([...holidays, holidayInput].sort());
    setHolidayInput("");
  };

  const removeHoliday = (value: string) => {
    setHolidays(holidays.filter((h) => h !== value));
  };

  const saveToHistory = () => {
    if (!result || !canSave) return;
    addEntry({
      tool: TOOL_SLUG,
      toolName: "Business Days",
      signature,
      summary: `${result.total} workdays`,
      details: {
        From: start,
        To: end,
        Workdays: String(result.total),
        Weekends: String(result.weekends),
        Holidays: String(result.holidaysApplied),
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
    if (!result) return {};
    const s = result.start;
    const e = result.end;

    // Calculate months spanned roughly
    const monthsSpanned =
      (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());

    // Calculate weeks spanned
    const weeksSpanned = Math.ceil(result.calendarDays / 7);

    // Average business days per week
    const avgPerWeek =
      weeksSpanned > 0 ? (result.total / weeksSpanned).toFixed(1) : "0.0";

    return {
      monthsSpanned,
      weeksSpanned,
      avgPerWeek,
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

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Start date"
                type="date"
                name="start"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                onKeyDown={handleDateKeyDown}
                onPaste={handleDatePaste}
                onClick={handleDateClick}
                inputMode="none"
                style={{ caretColor: "transparent" }}
              />
              <Input
                label="End date"
                type="date"
                name="end"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                onKeyDown={handleDateKeyDown}
                onPaste={handleDatePaste}
                onClick={handleDateClick}
                inputMode="none"
                style={{ caretColor: "transparent" }}
              />
            </div>

            {/* Holidays */}
            <div className="mt-5">
              <p className="mb-2 text-sm font-bold text-foreground">
                Holidays{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </p>
              <div className="flex gap-2">
                <Input
                  type="date"
                  name="holiday"
                  value={holidayInput}
                  onChange={(e) => setHolidayInput(e.target.value)}
                  onKeyDown={handleDateKeyDown}
                  onPaste={handleDatePaste}
                  onClick={handleDateClick}
                  inputMode="none"
                  style={{ caretColor: "transparent" }}
                />
                <Button
                  variant="secondary"
                  onClick={addHoliday}
                  disabled={!holidayInput}
                  className="shrink-0 px-3"
                  aria-label="Add holiday"
                >
                  <Plus size={15} />
                </Button>
              </div>

              {holidays.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {holidays.map((h) => (
                    <li
                      key={h}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-1 font-mono text-xs text-foreground"
                    >
                      {h}
                      <button
                        type="button"
                        onClick={() => removeHoliday(h)}
                        aria-label={`Remove ${h}`}
                        className="grid size-4 place-items-center rounded text-muted-foreground transition hover:text-destructive"
                      >
                        <X size={11} />
                      </button>
                    </li>
                  ))}
                </ul>
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

            <div className="mt-6 flex flex-wrap items-start gap-2 text-xs text-muted-foreground sm:mt-7">
              <BriefcaseBusiness
                size={15}
                className="mt-0.5 shrink-0 text-primary"
              />
              <span>
                Weekends are excluded automatically. Both endpoints count if
                they fall on a weekday.
              </span>
            </div>
          </div>

          {/* RIGHT: result */}
          {result ? (
            <ResultPanel title="Business days">
              <p className="ticker font-mono text-[clamp(36px,8vw,48px)] font-medium tracking-[-.08em] text-foreground">
                {result.total.toLocaleString()}
                <span className="ml-2 text-[clamp(18px,4vw,24px)] text-muted-foreground">
                  days
                </span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {result.reversed
                  ? "Range runs backward — order preserved."
                  : "Monday through Friday, holidays removed."}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 pt-4">
                <span className="text-xs text-muted-foreground">
                  {result.weekends} weekend day
                  {result.weekends === 1 ? "" : "s"} skipped
                </span>
                <CopyButton value={`${result.total} business days`} />
              </div>
            </ResultPanel>
          ) : (
            <ResultPanel empty>
              <p className="text-sm leading-6 text-muted-foreground">
                Pick two dates to count the weekdays inside them.
              </p>
            </ResultPanel>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* DETAILS BREAKDOWN                                            */}
      {/* ============================================================ */}
      {result && (
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
                  Breakdown of the business days calculation.
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
                  transform: showDetailedView
                    ? "rotate(90deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>
          </div>

          {/* Rows */}
          <ul className="space-y-1.5">
            {[
              {
                label: "Start date",
                value: dateLabel(result.start, {
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
                label: "End date",
                value: dateLabel(result.end, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
                bg: "var(--row-weeks-bg)",
                icon: "var(--row-weeks-icon)",
                text: "var(--row-weeks-text)",
                Icon: CalendarDays,
              },
              {
                label: "Calendar days",
                value: `${result.calendarDays.toLocaleString()} days`,
                bg: "var(--row-days-bg)",
                icon: "var(--row-days-icon)",
                text: "var(--row-days-text)",
                Icon: Clock3,
              },
              {
                label: "Weekend days",
                value: `${result.weekends.toLocaleString()} days`,
                bg: "var(--row-months-bg)",
                icon: "var(--row-months-icon)",
                text: "var(--row-months-text)",
                Icon: CalendarDays,
              },
              {
                label: "Holidays applied",
                value: `${result.holidaysApplied.toLocaleString()}`,
                bg: "var(--row-weeks-bg)",
                icon: "var(--row-weeks-icon)",
                text: "var(--row-weeks-text)",
                Icon: Calendar,
              },
              {
                label: "Business days",
                value: `${result.total.toLocaleString()} days`,
                bg: "var(--row-days-bg)",
                icon: "var(--row-days-icon)",
                text: "var(--row-days-text)",
                Icon: BriefcaseBusiness,
              },
              // CONDITIONAL EXTRA ROWS FOR DETAILED VIEW
              ...(showDetailedView
                ? [
                    {
                      label: "Weeks spanned",
                      value: `${extra.weeksSpanned} weeks`,
                      bg: "var(--row-months-bg)",
                      icon: "var(--row-months-icon)",
                      text: "var(--row-months-text)",
                      Icon: BarChart3,
                    },
                    {
                      label: "Months spanned",
                      value: `${extra.monthsSpanned} months`,
                      bg: "var(--row-weeks-bg)",
                      icon: "var(--row-weeks-icon)",
                      text: "var(--row-weeks-text)",
                      Icon: CalendarDays,
                    },
                    {
                      label: "Avg business days / week",
                      value: `${extra.avgPerWeek} days`,
                      bg: "var(--row-days-bg)",
                      icon: "var(--row-days-icon)",
                      text: "var(--row-days-text)",
                      Icon: Clock3,
                    },
                  ]
                : []),
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