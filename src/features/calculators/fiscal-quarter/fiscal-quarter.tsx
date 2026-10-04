// src/features/calculators/fiscal-quarter/fiscal-quarter.tsx
"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarRange, Check, Copy } from "lucide-react";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { cn } from "@/lib/utils";
import {
  computeFiscal,
  daysUntilFiscalYearEnd,
  daysUntilNextQuarter,
  FISCAL_PRESETS,
  MONTH_NAMES,
  type QuarterInfo,
} from "./logic";

const TOOL_SLUG = "fiscal-quarter";

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
      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[var(--purple)] transition hover:opacity-80"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Quarter card                                                       */
/* ------------------------------------------------------------------ */

function QuarterCard({ q }: { q: QuarterInfo }) {
  const isCurrent = q.status === "current";
  const isPast = q.status === "past";

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition",
        isCurrent
          ? "border-[var(--purple)]/50 bg-[var(--surface-result)] shadow-[0_0_16px_rgba(99,84,232,0.2)]"
          : isPast
            ? "border-[var(--border-card)] bg-[var(--surface-btn-secondary)] opacity-60"
            : "border-[var(--border-card)] bg-[var(--surface-card)]"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[14px] font-bold text-[var(--text-primary)]">
          Q{q.index}
        </p>
        {isCurrent && (
          <span className="rounded-full bg-[var(--purple)]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--purple)]">
            Current
          </span>
        )}
        {isPast && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Done
          </span>
        )}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        {format(q.start, "MMM d")} → {format(q.end, "MMM d")}
      </p>

      <div className="mt-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-btn-secondary)]">
          <div
            className={cn(
              "h-full rounded-full transition-[width]",
              isCurrent
                ? "bg-[var(--purple)]"
                : isPast
                  ? "bg-slate-400 dark:bg-slate-500"
                  : "bg-transparent"
            )}
            style={{ width: `${q.progressPct}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] font-medium text-muted-foreground">
          {q.daysTotal} days
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export function FiscalQuarter() {
  const [startMonth, setStartMonth] = useState(4); // April
  const [startDay, setStartDay] = useState(1);
  const [dateISO, setDateISO] = useState(format(new Date(), "yyyy-MM-dd"));

  const reference = useMemo(() => {
    try {
      const d = parseISO(dateISO);
      d.setHours(12, 0, 0, 0);
      return d;
    } catch {
      return new Date();
    }
  }, [dateISO]);

  const config = useMemo(
    () => ({ startMonth, startDay }),
    [startMonth, startDay]
  );

  const result = useMemo(
    () => computeFiscal(reference, config),
    [reference, config]
  );

  const untilNext = useMemo(() => daysUntilNextQuarter(result), [result]);
  const untilYearEnd = useMemo(
    () => daysUntilFiscalYearEnd(result),
    [result]
  );

  const applyPreset = (month: number, day: number) => {
    setStartMonth(month);
    setStartDay(day);
  };

  return (
    <div className="space-y-4">
      <section className="tool-card rounded-3xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 sm:p-7">
        <ToolCardHeader slug={TOOL_SLUG} />

        {/* Preset chips */}
        <div className="mt-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
            Common fiscal years
          </p>
          <div className="flex flex-wrap gap-2">
            {FISCAL_PRESETS.map((p) => {
              const active = p.month === startMonth && p.day === startDay;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.month, p.day)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-bold transition",
                    active
                      ? "bg-[var(--purple)] text-white"
                      : "bg-[var(--surface-btn-secondary)] text-muted-foreground hover:opacity-80"
                  )}
                >
                  {p.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px]",
                      active ? "bg-white/20" : "bg-[var(--surface-card)]"
                    )}
                  >
                    {MONTH_NAMES[p.month - 1].slice(0, 3)} {p.day}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <label className="text-[13px] font-semibold text-[var(--text-primary)]">
              Fiscal year starts in
            </label>
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(Number(e.target.value))}
              className="h-[42px] w-full rounded-[10px] border border-[var(--border-input)] bg-[var(--surface-input)] px-3.5 text-[15px] text-[var(--text-input)] outline-none"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className="text-[13px] font-semibold text-[var(--text-primary)]">
              Day
            </label>
            <input
              type="number"
              min={1}
              max={31}
              value={startDay}
              onChange={(e) => setStartDay(Number(e.target.value))}
              className="h-[42px] w-full rounded-[10px] border border-[var(--border-input)] bg-[var(--surface-input)] px-3.5 text-[15px] text-[var(--text-input)] outline-none"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-[13px] font-semibold text-[var(--text-primary)]">
              Reference date
            </label>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              className="h-[42px] w-full rounded-[10px] border border-[var(--border-input)] bg-[var(--surface-input)] px-3.5 text-[15px] text-[var(--text-input)] outline-none"
            />
          </div>
        </div>

        {/* Main content */}
        <div className="mt-6 flex flex-col gap-6">
          <div className="w-full">
            {/* Current quarter hero */}
            <div className="rounded-2xl border border-[var(--border-card)] bg-gradient-to-br from-violet-50 to-indigo-50 p-6 text-center dark:border-[var(--purple)]/30 dark:from-violet-500/10 dark:to-indigo-500/5">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--purple)]">
                Current quarter
              </p>
              <p className="mt-2 font-mono text-[clamp(40px,10vw,64px)] font-bold leading-none tracking-[-.04em] text-[var(--text-primary)]">
                Q{result.quarter.index}
                <span className="ml-3 text-[clamp(18px,4vw,24px)] text-[var(--purple)]">
                  FY{result.quarter.fiscalYear}
                </span>
              </p>
              <p className="mt-3 text-[14px] font-medium text-[var(--text-primary)]">
                {format(result.quarter.start, "MMM d, yyyy")} →{" "}
                {format(result.quarter.end, "MMM d, yyyy")}
              </p>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-btn-secondary)]">
                  <div
                    className="h-full rounded-full bg-[var(--purple)] transition-[width] duration-300"
                    style={{ width: `${result.quarter.progressPct}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    Day {result.quarter.daysElapsed} of{" "}
                    {result.quarter.daysTotal}
                  </span>
                  <span className="font-bold text-[var(--purple)]">
                    {result.quarter.progressPct}% complete
                  </span>
                </div>
              </div>

              {/* Stat pills */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] px-3 py-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Days left in Q
                  </p>
                  <p className="mt-1 font-mono text-[16px] font-bold text-[var(--text-primary)]">
                    {result.quarter.daysRemaining}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] px-3 py-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    To next Q
                  </p>
                  <p className="mt-1 font-mono text-[16px] font-bold text-[var(--text-primary)]">
                    {untilNext}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] px-3 py-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    To year end
                  </p>
                  <p className="mt-1 font-mono text-[16px] font-bold text-[var(--text-primary)]">
                    {untilYearEnd}
                  </p>
                </div>
              </div>
            </div>

            {/* Quarter grid */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {result.allQuarters.map((q) => (
                <QuarterCard key={q.index} q={q} />
              ))}
            </div>

            {/* Fiscal year summary */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] px-4 py-3">
              <span className="inline-flex items-center gap-2 text-[12px] text-muted-foreground">
                <CalendarRange size={13} />
                FY{result.quarter.fiscalYear}:{" "}
                {format(result.fiscalYearStart, "MMM d, yyyy")} →{" "}
                {format(result.fiscalYearEnd, "MMM d, yyyy")}
              </span>
              <CopyButton
                value={`Q${result.quarter.index} FY${result.quarter.fiscalYear}: ${format(result.quarter.start, "yyyy-MM-dd")} to ${format(result.quarter.end, "yyyy-MM-dd")}`}
              />
            </div>
          </div>

          {/* Breakdown */}
          <div
            className="rounded-[18px] p-5 sm:p-6"
            style={{
              backgroundColor: "var(--surface-card)",
              border: "1px solid var(--border-card)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="mb-5 flex items-start gap-3">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-[14px] sm:size-[52px]"
                style={{
                  backgroundColor: "var(--surface-icon-breakdown)",
                  color: "var(--row-months-icon)",
                }}
              >
                <CalendarRange size={22} />
              </span>
              <div>
                <h2 className="text-[18px] font-bold text-[var(--text-primary)] sm:text-[20px]">
                  Quarter breakdown
                </h2>
                <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">
                  All four quarters of the current fiscal year.
                </p>
              </div>
            </div>

            <ul className="space-y-1.5">
              {result.allQuarters.map((q) => (
                <li
                  key={q.index}
                  className={cn(
                    "flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[10px] px-3 py-2",
                    q.status === "current" && "ring-2 ring-[var(--purple)]/40"
                  )}
                  style={{
                    backgroundColor:
                      q.status === "current"
                        ? "var(--surface-result)"
                        : "var(--surface-btn-secondary)",
                  }}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--surface-card)] text-[var(--purple)] font-bold text-[10px]">
                    Q{q.index}
                  </span>
                  <span className="shrink-0 text-[13px] font-semibold text-[var(--text-primary)] sm:text-[14px]">
                    {format(q.start, "MMM d")} – {format(q.end, "MMM d, yyyy")}
                  </span>
                  <span className="min-w-0 flex-1 text-right text-[13px] font-medium text-muted-foreground sm:text-[14px]">
                    {q.daysTotal} days
                    {q.status === "current" && (
                      <span className="ml-2 font-bold text-[var(--purple)]">
                        · {q.daysRemaining} left
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}