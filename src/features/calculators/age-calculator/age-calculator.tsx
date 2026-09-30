"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Save,
} from "lucide-react";
import { useHistory } from "@/components/history/history-context";
import { dateLabel, isoToday, localDate } from "@/lib/date-time";
import { getAgeFromInput, getAgeBreakdown } from "./logic";

/* ------------------------------------------------------------------ */
/*  Copy control                                                       */
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
      className="inline-flex items-center gap-1.5 text-[12px] font-bold transition hover:opacity-80"
      style={{ color: "var(--purple)" }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

const TOOL_SLUG = "age-calculator";

export function AgeCalculator() {
  const [birth, setBirth] = useState("1990-06-14");
  const [asOf, setAsOf] = useState(isoToday());
  const [justSaved, setJustSaved] = useState(false);
  const { addEntry, hasSignature } = useHistory();

  const age = useMemo(
    () => (birth && asOf ? getAgeFromInput(birth, asOf) : null),
    [birth, asOf]
  );

  const breakdown = useMemo(
    () => (birth && asOf ? getAgeBreakdown(birth, asOf) : null),
    [birth, asOf]
  );

  const signature = `${birth}|${asOf}`;
  const alreadySaved = hasSignature(TOOL_SLUG, signature);
  const canSave = Boolean(age) && !alreadySaved;

  const saveToHistory = () => {
    if (!age || !canSave) return;
    addEntry({
      tool: TOOL_SLUG,
      toolName: "Age Calculator",
      signature,
      summary: `${age.years}y ${age.months}m ${age.days}d`,
      details: {
        "Date of birth": birth,
        "Calculated on": asOf,
        "Total days": age.totalDays.toLocaleString(),
      },
    });
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1400);
  };

  const saveLabel = justSaved
    ? "Saved"
    : alreadySaved
      ? "Already saved"
      : "Save to history";

  const asOfLabel = asOf
    ? dateLabel(localDate(asOf), {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="space-y-4">
      {/* ============================================================ */}
      {/* AGE CALCULATOR                                               */}
      {/* ============================================================ */}
      <section
        className="rounded-[18px] p-7"
        style={{
          backgroundColor: "var(--surface-card)",
          border: "1px solid var(--border-card)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(340px,.78fr)] lg:items-start">
          {/* ------------------------------------------------------ */}
          {/* LEFT                                                    */}
          {/* ------------------------------------------------------ */}
          <div className="min-w-0">
            {/* Header */}
            <div className="mb-6 flex items-start gap-4">
              <span
                className="grid size-[52px] shrink-0 place-items-center rounded-[14px]"
                style={{
                  backgroundColor: "var(--surface-icon-calc)",
                  color: "var(--purple)",
                }}
              >
                <Calendar size={24} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h2
                  className="text-2xl font-bold tracking-[-.02em]"
                  style={{ color: "var(--text-primary)" }}
                >
                  Age Calculator
                </h2>
                <p
                  className="mt-0.5 text-[14px] leading-snug"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Find your exact age in years, months, and days.
                </p>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Date of birth
                </span>
                <input
                  type="date"
                  name="birth"
                  value={birth}
                  max={isoToday()}
                  onChange={(e) => setBirth(e.target.value)}
                  className="h-[42px] w-full rounded-[10px] px-3.5 text-[15px] outline-none transition"
                  style={{
                    backgroundColor: "var(--surface-input)",
                    border: "1px solid var(--border-input)",
                    color: "var(--text-input)",
                  }}
                />
              </label>

              <label className="grid gap-1.5">
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Calculate age on
                </span>
                <input
                  type="date"
                  name="asOf"
                  value={asOf}
                  onChange={(e) => setAsOf(e.target.value)}
                  className="h-[42px] w-full rounded-[10px] px-3.5 text-[15px] outline-none transition"
                  style={{
                    backgroundColor: "var(--surface-input)",
                    border: "1px solid var(--border-input)",
                    color: "var(--text-input)",
                  }}
                />
              </label>
            </div>

            {/* Buttons */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                className="inline-flex h-[42px] items-center gap-2 rounded-[10px] px-4 text-sm font-bold text-white transition hover:brightness-110"
                style={{
                  backgroundColor: "var(--purple)",
                  boxShadow: "var(--shadow-btn-primary)",
                }}
              >
                <Calendar size={15} />
                Calculate Age
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={saveToHistory}
                disabled={!canSave}
                className="inline-flex h-[42px] items-center gap-2 rounded-[10px] px-4 text-sm font-bold transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
                style={{
                  backgroundColor: "var(--surface-btn-secondary)",
                  border: "1px solid var(--border-btn-secondary)",
                  color: "var(--text-btn-secondary)",
                }}
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
                {saveLabel}
              </button>
            </div>

            {/* Error */}
            {birth && asOf && !age && (
              <p className="mt-4 text-sm font-semibold text-destructive">
                The comparison date needs to be after the birth date.
              </p>
            )}

            {/* Footer hint */}
            <p
              className="mt-4 text-[12px] leading-5"
              style={{ color: "var(--text-muted)" }}
            >
              Updates as you type • Inclusive calendar calculation
            </p>
          </div>

          {/* ------------------------------------------------------ */}
          {/* RIGHT: result panel                                     */}
          {/* ------------------------------------------------------ */}
          {age ? (
            <aside
              className="rounded-[14px] p-[18px]"
              style={{
                backgroundColor: "var(--surface-result)",
                border: "1px solid var(--border-result)",
              }}
            >
              {/* Label row */}
              <div className="mb-4 flex items-center justify-between">
                <span
                  className="text-[11px] font-bold uppercase tracking-[1.3px]"
                  style={{ color: "var(--text-result-label)" }}
                >
                  Your Age
                </span>
                <span
                  className="grid size-8 place-items-center rounded-lg"
                  style={{
                    backgroundColor: "var(--surface-card)",
                    color: "var(--purple)",
                  }}
                >
                  <Calendar size={15} />
                </span>
              </div>

              {/* Big numbers */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: age.years, l: "years" },
                  { v: age.months, l: "months" },
                  { v: age.days, l: "days" },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <p
                      className="text-[40px] font-bold leading-none tracking-[-.04em]"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {v}
                    </p>
                    <p
                      className="mt-1 text-[12px] font-medium"
                      style={{ color: "var(--text-result-units)" }}
                    >
                      {l}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total days line */}
              <div className="mt-5 flex items-start gap-3">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full"
                  style={{
                    backgroundColor: "var(--surface-card)",
                    color: "var(--purple)",
                  }}
                >
                  <Calendar size={16} />
                </span>
                <p
                  className="text-[13px] leading-5"
                  style={{ color: "var(--text-result-units)" }}
                >
                  That is{" "}
                  <strong
                    className="font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {age.totalDays.toLocaleString()}
                  </strong>{" "}
                  days
                  <br />
                  of lived time.
                </p>
              </div>

              {/* Footer */}
              <div
                className="mt-5 flex items-center justify-between gap-2 pt-4"
                style={{ borderTop: "1px solid var(--border-divider)" }}
              >
                <span
                  className="text-[12px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  As of {asOfLabel}
                </span>
                <CopyButton
                  value={`${age.years} years, ${age.months} months, ${age.days} days`}
                />
              </div>
            </aside>
          ) : (
            <aside
              className="flex min-h-[240px] items-center justify-center rounded-[14px] p-[18px] text-center"
              style={{
                backgroundColor: "var(--surface-result)",
                border: "1px dashed var(--border-result)",
              }}
            >
              <p
                className="max-w-[240px] text-sm leading-6"
                style={{ color: "var(--text-secondary)" }}
              >
                Add a birth date and a valid comparison date to see an exact
                age.
              </p>
            </aside>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* AGE BREAKDOWN                                                */}
      {/* ============================================================ */}
      {breakdown && (
        <section
          className="rounded-[18px] p-6"
          style={{
            backgroundColor: "var(--surface-card)",
            border: "1px solid var(--border-card)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Header */}
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className="grid size-[52px] shrink-0 place-items-center rounded-[14px]"
                style={{
                  backgroundColor: "var(--surface-icon-breakdown)",
                  color: "var(--row-months-icon)",
                }}
              >
                <svg
                  width="22"
                  height="22"
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
                  className="text-[20px] font-bold tracking-[-.02em]"
                  style={{ color: "var(--text-primary)" }}
                >
                  Age Breakdown
                </h2>
                <p
                  className="mt-0.5 text-[13px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Your age in different units of time.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] px-4 text-[13px] font-semibold transition hover:brightness-105"
              style={{
                backgroundColor: "var(--surface-btn-secondary)",
                border: "1px solid var(--border-btn-secondary)",
                color: "var(--text-btn-secondary)",
              }}
            >
              Detailed view
              <ArrowRight size={13} style={{ color: "var(--purple)" }} />
            </button>
          </div>

          {/* Rows */}
          <ul className="space-y-1.5">
            {[
              {
                label: "Age in Months",
                value: `${breakdown.months.total.toLocaleString()} months, ${breakdown.months.remainderWeeks} week${breakdown.months.remainderWeeks === 1 ? "" : "s"}, and ${breakdown.months.remainderDays} day${breakdown.months.remainderDays === 1 ? "" : "s"}`,
                bg: "var(--row-months-bg)",
                icon: "var(--row-months-icon)",
                text: "var(--row-months-text)",
                Icon: Calendar,
              },
              {
                label: "Age in Weeks",
                value: `${breakdown.weeks.total.toLocaleString()} weeks and ${breakdown.weeks.remainderDays} day${breakdown.weeks.remainderDays === 1 ? "" : "s"}`,
                bg: "var(--row-weeks-bg)",
                icon: "var(--row-weeks-icon)",
                text: "var(--row-weeks-text)",
                Icon: Clock3,
              },
              {
                label: "Age in Days",
                value: `${breakdown.days.toLocaleString()} days`,
                bg: "var(--row-days-bg)",
                icon: "var(--row-days-icon)",
                text: "var(--row-days-text)",
                Icon: CalendarDays,
              },
            ].map((row) => {
              const Icon = row.Icon;
              return (
                <li
                  key={row.label}
                  className="flex h-9 items-center gap-3 rounded-[10px] px-3"
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
                    className="w-[120px] shrink-0 text-[14px] font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {row.label}
                  </span>
                  <span
                    className="min-w-0 flex-1 truncate text-[14px] font-medium"
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