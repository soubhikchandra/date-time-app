"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, Check, Copy, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-card";
import { BreakdownCard } from "@/components/ui/breakdown-card";
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

  return (
    <div className="space-y-6">
      <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] lg:gap-8">
          {/* LEFT: header + form */}
          <div className="min-w-0">
            <ToolCardHeader slug={TOOL_SLUG} />

            <div className="grid gap-4 sm:grid-cols-[1fr_150px] sm:items-end">
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

            <div className="mt-7 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarPlus size={15} className="text-primary" />
              <span>
                Moves forward from the starting date — weekends included.
              </span>
            </div>
          </div>

          {/* RIGHT: result */}
          {result ? (
            <ResultPanel title="New date">
              <p className="ticker font-mono text-3xl font-medium tracking-[-.06em] text-foreground sm:text-4xl">
                {dateLabel(result.result, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {dateLabel(result.result, { year: "numeric" })}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
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

      {result && result.amount > 0 && (
        <BreakdownCard
          title="Details"
          rows={[
            {
              label: "Starting date",
              value: dateLabel(result.from, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            },
            {
              label: "Days added",
              value: `${result.amount.toLocaleString()} day${
                result.amount === 1 ? "" : "s"
              }`,
            },
            {
              label: "Resulting date",
              value: dateLabel(result.result, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            },
            {
              label: "Weeks spanned",
              value: `${Math.floor(result.amount / 7)} week${
                Math.floor(result.amount / 7) === 1 ? "" : "s"
              } + ${result.amount % 7} day${
                result.amount % 7 === 1 ? "" : "s"
              }`,
            },
          ]}
        />
      )}
    </div>
  );
}
