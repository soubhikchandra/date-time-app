"use client";

import { useMemo, useState } from "react";
import {
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Save,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-card";
import { BreakdownCard } from "@/components/ui/breakdown-card";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { useHistory } from "@/components/history/history-context";
import { dateLabel, isoToday } from "@/lib/date-time";
import {
  getWeekNumber,
  shiftWeek,
  getDatesFromWeek,
  getWeekStats,
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
      {copied ? "Copied" : "Copy result"}
    </button>
  );
}

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
        "rounded-lg px-3 py-2 text-xs font-bold transition " +
        (active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}

const TOOL_SLUG = "week-number";

export function WeekNumber() {
  const [mode, setMode] = useState<"date" | "week">("date");

  // Date → Week
  const [date, setDate] = useState(isoToday());

  // Week → Date
  const nowWeek = useMemo(() => getWeekNumber(isoToday()), []);
  const [weekInput, setWeekInput] = useState(String(nowWeek?.week ?? 1));
  const [yearInput, setYearInput] = useState(String(nowWeek?.year ?? new Date().getFullYear()));

  const [justSaved, setJustSaved] = useState(false);
  const { addEntry, hasSignature } = useHistory();

  /* --- Date mode result --- */
  const result = useMemo(() => getWeekNumber(date), [date]);
  const stats = useMemo(() => getWeekStats(date), [date]);

  /* --- Week mode result --- */
  const weekResult = useMemo(() => {
    const w = Number(weekInput);
    const y = Number(yearInput);
    return getDatesFromWeek(w, y);
  }, [weekInput, yearInput]);

  /* --- History --- */
  const signature =
    mode === "date"
      ? `date:${date}`
      : `week:${weekInput}-${yearInput}`;

  const alreadySaved = hasSignature(TOOL_SLUG, signature);
  const canSave =
    mode === "date" ? Boolean(result) && !alreadySaved : Boolean(weekResult?.invalid === false) && !alreadySaved;

  const saveToHistory = () => {
    if (!canSave) return;
    if (mode === "date" && result) {
      addEntry({
        tool: TOOL_SLUG,
        toolName: "Week Number",
        signature,
        summary: `W${result.week} · ${result.year}`,
        details: {
          Date: date,
          "ISO week": `W${result.week}`,
          "ISO year": String(result.year),
        },
      });
    } else if (mode === "week" && weekResult && !weekResult.invalid) {
      addEntry({
        tool: TOOL_SLUG,
        toolName: "Week Number",
        signature,
        summary: `W${weekResult.week} · ${weekResult.year}`,
        details: {
          Week: `W${weekResult.week}`,
          Year: String(weekResult.year),
          Starts: dateLabel(weekResult.start, { month: "short", day: "numeric", year: "numeric" }),
          Ends: dateLabel(weekResult.end, { month: "short", day: "numeric", year: "numeric" }),
        },
      });
    }
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1400);
  };

  const buttonLabel = justSaved
    ? "Saved to history"
    : alreadySaved
      ? "Already in history"
      : "Save to history";

  /* --- Arrows --- */
  const goPrevWeek = () => setDate((d) => shiftWeek(d, -1));
  const goNextWeek = () => setDate((d) => shiftWeek(d, 1));

  return (
    <div className="space-y-6">
      <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
        {/* Mode tabs */}
        <div className="mb-6 inline-flex rounded-xl bg-muted p-1">
          <ModeTab active={mode === "date"} onClick={() => setMode("date")}>
            Date → Week
          </ModeTab>
          <ModeTab active={mode === "week"} onClick={() => setMode("week")}>
            Week → Dates
          </ModeTab>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] lg:gap-8">
          {/* LEFT: header + form */}
          <div className="min-w-0">
            <ToolCardHeader slug={TOOL_SLUG} />

            {mode === "date" ? (
              <>
                <Input
                  label="Date"
                  type="date"
                  name="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </>
            ) : (
              <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
                <Input
                  label="Week"
                  type="number"
                  name="week"
                  min={1}
                  max={53}
                  value={weekInput}
                  onChange={(e) => setWeekInput(e.target.value)}
                />
                <Input
                  label="Year"
                  type="number"
                  name="year"
                  min={1900}
                  max={2200}
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                />
              </div>
            )}

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

            {mode === "week" && weekResult?.invalid && (
              <p className="mt-4 text-sm font-semibold text-destructive">
                {weekResult.year} only has {weekResult.totalWeeks} weeks — W
                {weekResult.week} doesn&apos;t exist.
              </p>
            )}

            <div className="mt-7 flex items-start gap-2 text-xs text-muted-foreground">
              <AlarmClock size={15} className="mt-0.5 shrink-0 text-primary" />
              <span>
                ISO weeks start on Monday. Week 1 contains the first Thursday
                of the year.
              </span>
            </div>
          </div>

          {/* RIGHT: result */}
          {mode === "date" ? (
            result ? (
              <ResultPanel title="ISO week">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={goPrevWeek}
                    aria-label="Previous week"
                    className="grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  <p className="ticker font-mono text-6xl font-medium text-foreground">
                    <span className="mr-2 text-2xl text-muted-foreground">
                      W
                    </span>
                    {result.week}
                  </p>

                  <button
                    type="button"
                    onClick={goNextWeek}
                    aria-label="Next week"
                    className="grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {result.crossYear
                    ? `ISO year ${result.year} — differs from calendar year.`
                    : `ISO year ${result.year}.`}
                </p>

                {/* Stat pills */}
                {stats && (
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-primary/15 bg-primary/[.06] px-3 py-2.5">
                      <p className="font-mono text-[9px] uppercase tracking-[.18em] text-primary">
                        Weeks left
                      </p>
                      <p className="ticker mt-1 font-mono text-lg font-medium text-foreground">
                        {stats.weeksLeft}
                      </p>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-primary/[.06] px-3 py-2.5">
                      <p className="font-mono text-[9px] uppercase tracking-[.18em] text-primary">
                        Days left
                      </p>
                      <p className="ticker mt-1 font-mono text-lg font-medium text-foreground">
                        {stats.daysLeftInWeek}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
                  <span className="text-xs text-muted-foreground">
                    {result.week} of {stats?.totalWeeks ?? "52–53"}
                  </span>
                  <CopyButton
                    value={`ISO week ${result.week} of ${result.year}`}
                  />
                </div>
              </ResultPanel>
            ) : (
              <ResultPanel empty>
                <p className="text-sm leading-6 text-muted-foreground">
                  Choose a date to find its ISO week number.
                </p>
              </ResultPanel>
            )
          ) : weekResult && !weekResult.invalid ? (
            <ResultPanel title="Week range">
              <p className="ticker font-mono text-2xl font-medium tracking-[-.04em] text-foreground">
                {dateLabel(weekResult.start, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="ticker mt-1 font-mono text-2xl font-medium tracking-[-.04em] text-foreground">
                {dateLabel(weekResult.end, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Monday through Sunday of W{weekResult.week}, {weekResult.year}.
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
                <span className="text-xs text-muted-foreground">
                  {weekResult.totalWeeks} weeks in {weekResult.year}
                </span>
                <CopyButton
                  value={`W${weekResult.week} ${weekResult.year}: ${dateLabel(
                    weekResult.start,
                    { month: "short", day: "numeric" }
                  )} – ${dateLabel(weekResult.end, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}`}
                />
              </div>
            </ResultPanel>
          ) : (
            <ResultPanel empty>
              <p className="text-sm leading-6 text-muted-foreground">
                Enter a week number (1–53) and year to see the Monday–Sunday
                range.
              </p>
            </ResultPanel>
          )}
        </div>
      </section>

      {/* Breakdown: only in date mode */}
      {mode === "date" && result && (
        <BreakdownCard
          title="Week details"
          rows={[
            {
              label: "Week starts",
              value: dateLabel(result.start, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            },
            {
              label: "Week ends",
              value: dateLabel(result.end, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            },
            {
              label: "Days left in week",
              value: `${stats?.daysLeftInWeek ?? "—"} day${
                stats?.daysLeftInWeek === 1 ? "" : "s"
              }`,
            },
            {
              label: "Weeks left in year",
              value: `${stats?.weeksLeft ?? "—"} week${
                stats?.weeksLeft === 1 ? "" : "s"
              }`,
            },
            {
              label: "ISO week number",
              value: `W${result.week}`,
            },
            {
              label: "ISO year",
              value: String(result.year),
            },
          ]}
        />
      )}

      {/* Breakdown: week mode */}
      {mode === "week" && weekResult && !weekResult.invalid && (
        <BreakdownCard
          title="Week details"
          rows={[
            {
              label: "Week starts",
              value: dateLabel(weekResult.start, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            },
            {
              label: "Week ends",
              value: dateLabel(weekResult.end, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            },
            {
              label: "ISO week",
              value: `W${weekResult.week}`,
            },
            {
              label: "ISO year",
              value: String(weekResult.year),
            },
            {
              label: "Total weeks in year",
              value: `${weekResult.totalWeeks}`,
            },
          ]}
        />
      )}
    </div>
  );
}