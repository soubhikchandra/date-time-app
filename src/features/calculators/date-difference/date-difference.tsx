"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Check, Copy, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-card";
import { BreakdownCard } from "@/components/ui/breakdown-card";
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

            <div className="mt-7 flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowDownUp size={15} className="text-primary" />
              <span>Order is preserved — dates can run backward.</span>
            </div>
          </div>

          {/* RIGHT: result */}
          {diff ? (
            <ResultPanel title="Difference">
              <p className="ticker font-mono text-5xl font-medium tracking-[-.08em] text-foreground">
                {diff.totalDays.toLocaleString()}
                <span className="ml-2 text-2xl text-muted-foreground">
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
              <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
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

      {diff && diff.totalDays > 0 && (
        <BreakdownCard
          title="Full breakdown"
          rows={[
            {
              label: "Calendar",
              value: `${diff.calendar.years} year${
                diff.calendar.years === 1 ? "" : "s"
              }, ${diff.calendar.months} month${
                diff.calendar.months === 1 ? "" : "s"
              }, ${diff.calendar.days} day${
                diff.calendar.days === 1 ? "" : "s"
              }`,
            },
            {
              label: "Total months",
              value: `${diff.months.total.toLocaleString()} months and ${
                diff.months.remainderDays
              } day${diff.months.remainderDays === 1 ? "" : "s"}`,
            },
            {
              label: "Total weeks",
              value: `${diff.weeks.total.toLocaleString()} weeks and ${
                diff.weeks.remainderDays
              } day${diff.weeks.remainderDays === 1 ? "" : "s"}`,
            },
            {
              label: "Total days",
              value: `${diff.totalDays.toLocaleString()} days`,
            },
          ]}
        />
      )}
    </div>
  );
}