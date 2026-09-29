"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, Check, Copy, Plus, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-card";
import { BreakdownCard } from "@/components/ui/breakdown-card";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { useHistory } from "@/components/history/history-context";
import { dateLabel, isoToday } from "@/lib/date-time";
import { getBusinessDays } from "./logic";

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

  return (
    <div className="space-y-6">
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

            <div className="mt-7 flex items-start gap-2 text-xs text-muted-foreground">
              <BriefcaseBusiness size={15} className="mt-0.5 shrink-0 text-primary" />
              <span>
                Weekends are excluded automatically. Both endpoints count if
                they fall on a weekday.
              </span>
            </div>
          </div>

          {/* RIGHT: result */}
          {result ? (
            <ResultPanel title="Business days">
              <p className="ticker font-mono text-5xl font-medium tracking-[-.08em] text-foreground">
                {result.total.toLocaleString()}
                <span className="ml-2 text-2xl text-muted-foreground">
                  days
                </span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {result.reversed
                  ? "Range runs backward — order preserved."
                  : "Monday through Friday, holidays removed."}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
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

      {result && (
        <BreakdownCard
          title="Details"
          rows={[
            {
              label: "Start",
              value: dateLabel(result.start, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            },
            {
              label: "End",
              value: dateLabel(result.end, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            },
            {
              label: "Calendar days",
              value: `${result.calendarDays.toLocaleString()} days`,
            },
            {
              label: "Weekend days",
              value: `${result.weekends.toLocaleString()} days`,
            },
            {
              label: "Holidays applied",
              value: `${result.holidaysApplied.toLocaleString()}`,
            },
            {
              label: "Business days",
              value: `${result.total.toLocaleString()} days`,
            },
          ]}
        />
      )}
    </div>
  );
}