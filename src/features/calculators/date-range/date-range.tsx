// src/features/calculators/date-range/date-range.tsx
"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  CalendarRange,
  Check,
  Copy,
  Download,
  ListOrdered,
} from "lucide-react";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { cn } from "@/lib/utils";
import {
  getDateRange,
  RANGE_FILTERS,
  toCsv,
  toPlainList,
  WEEKDAY_LABELS,
  type RangeFilter,
} from "./logic";

const TOOL_SLUG = "date-range";
const MAX_VISIBLE = 500;

/* ------------------------------------------------------------------ */
/*  Initial value helpers — called once via lazy useState initializer  */
/* ------------------------------------------------------------------ */

function defaultStartISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

function defaultEndISO(): string {
  return format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
}

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */

function CopyButton({
  value,
  label = "Copy",
  icon = "copy",
}: {
  value: string;
  label?: string;
  icon?: "copy" | "download";
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
  const Icon = icon === "download" ? Download : Copy;
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--surface-card)] px-2.5 py-1.5 text-[12px] font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface-btn-secondary)]"
    >
      {copied ? <Check size={12} /> : <Icon size={12} />}
      {copied ? "Copied" : label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export function DateRange() {
  // Lazy initializers — Date.now() runs only on first mount, not every render
  const [fromISO, setFromISO] = useState<string>(defaultStartISO);
  const [toISO, setToISO] = useState<string>(defaultEndISO);
  const [filter, setFilter] = useState<RangeFilter>("all");

  const result = useMemo(
    () => getDateRange(fromISO, toISO, filter),
    [fromISO, toISO, filter]
  );

  const visibleDays = result ? result.days.slice(0, MAX_VISIBLE) : [];
  const truncated = result ? result.days.length > MAX_VISIBLE : false;

  const maxWeekdayCount = result
    ? Math.max(...result.weekdayCounts, 1)
    : 1;

  return (
    <div className="space-y-4">
      <section className="tool-card rounded-3xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 sm:p-7">
        <ToolCardHeader slug={TOOL_SLUG} />

        {/* Inputs row */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <label className="text-[13px] font-semibold text-[var(--text-primary)]">
              Start date
            </label>
            <input
              type="date"
              value={fromISO}
              onChange={(e) => setFromISO(e.target.value)}
              className="h-[42px] w-full rounded-[10px] border border-[var(--border-input)] bg-[var(--surface-input)] px-3.5 text-[15px] text-[var(--text-input)] outline-none"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-[13px] font-semibold text-[var(--text-primary)]">
              End date
            </label>
            <input
              type="date"
              value={toISO}
              onChange={(e) => setToISO(e.target.value)}
              className="h-[42px] w-full rounded-[10px] border border-[var(--border-input)] bg-[var(--surface-input)] px-3.5 text-[15px] text-[var(--text-input)] outline-none"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-[13px] font-semibold text-[var(--text-primary)]">
              Filter
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as RangeFilter)}
              className="h-[42px] w-full rounded-[10px] border border-[var(--border-input)] bg-[var(--surface-input)] px-3.5 text-[15px] text-[var(--text-input)] outline-none"
            >
              {RANGE_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        {result ? (
          <div className="mt-6 flex flex-col gap-4">
            {/* Summary strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Calendar days
                </p>
                <p className="mt-1 font-mono text-[20px] font-bold text-[var(--text-primary)]">
                  {result.calendarDays}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Listed dates
                </p>
                <p className="mt-1 font-mono text-[20px] font-bold text-[var(--text-primary)]">
                  {result.filteredCount}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Weekdays
                </p>
                <p className="mt-1 font-mono text-[20px] font-bold text-[var(--text-primary)]">
                  {result.weekdaysCount}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Weekends
                </p>
                <p className="mt-1 font-mono text-[20px] font-bold text-[var(--text-primary)]">
                  {result.weekendsCount}
                </p>
              </div>
            </div>

            {/* Range header */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] px-4 py-3">
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--text-primary)]">
                <CalendarRange size={14} className="text-[var(--purple)]" />
                {format(result.from, "MMM d, yyyy")} →{" "}
                {format(result.to, "MMM d, yyyy")}
                {result.reversed && (
                  <span className="ml-1 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                    Reversed
                  </span>
                )}
              </span>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={toPlainList(result)} label="Copy list" />
                <CopyButton
                  value={toCsv(result)}
                  label="Copy CSV"
                  icon="download"
                />
              </div>
            </div>

            {/* Weekday histogram */}
            <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
                Weekday distribution
              </p>
              <div className="grid grid-cols-7 gap-2">
                {result.weekdayCounts.map((count, i) => {
                  const heightPct =
                    maxWeekdayCount > 0 ? (count / maxWeekdayCount) * 100 : 0;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <p className="font-mono text-[11px] font-bold text-[var(--text-primary)]">
                        {count}
                      </p>
                      <div className="flex h-16 w-full items-end overflow-hidden rounded-md bg-[var(--surface-btn-secondary)]">
                        <div
                          className={cn(
                            "w-full rounded-md transition-[height] duration-300",
                            i >= 5
                              ? "bg-orange-400/70 dark:bg-orange-500/60"
                              : "bg-[var(--purple)]/70"
                          )}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-semibold text-muted-foreground">
                        {WEEKDAY_LABELS[i]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day list */}
            <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
                  <ListOrdered size={12} />
                  All dates ({result.filteredCount})
                </p>
                {truncated && (
                  <span className="text-[10px] text-muted-foreground">
                    Showing first {MAX_VISIBLE}
                  </span>
                )}
              </div>

              {result.filteredCount === 0 ? (
                <p className="text-[13px] text-muted-foreground">
                  No dates match this filter for the selected range.
                </p>
              ) : (
                <div
                  className={cn(
                    "grid gap-1.5 max-h-[420px] overflow-y-auto pr-1",
                    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                    "[&::-webkit-scrollbar]:w-1.5",
                    "[&::-webkit-scrollbar-thumb]:rounded-full",
                    "[&::-webkit-scrollbar-thumb]:bg-[var(--border-card)]"
                  )}
                >
                  {visibleDays.map((d) => (
                    <div
                      key={d.iso}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-2.5 py-2",
                        d.isWeekend
                          ? "border-orange-200 bg-orange-50/50 dark:border-orange-500/20 dark:bg-orange-500/5"
                          : "border-[var(--border-card)] bg-[var(--surface-btn-secondary)]"
                      )}
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-[var(--surface-card)] font-mono text-[10px] font-bold text-muted-foreground">
                        {d.index}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[12px] font-semibold text-[var(--text-primary)]">
                          {format(d.date, "MMM d, yyyy")}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                          d.isWeekend
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
                            : "bg-[var(--surface-card)] text-muted-foreground"
                        )}
                      >
                        {d.weekday}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--border-card)] p-6 text-center">
            <p className="text-[13px] text-muted-foreground">
              Pick a start and end date to see every date in the range.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}