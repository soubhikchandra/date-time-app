"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-card";
import { BreakdownCard } from "@/components/ui/breakdown-card";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { useHistory } from "@/components/history/history-context";
import { dateLabel, isoToday, localDate } from "@/lib/date-time";
import { getAgeFromInput, getAgeBreakdown } from "./logic";

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

  // Stable key from the current inputs.
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

  const buttonLabel = justSaved
    ? "Saved to history"
    : alreadySaved
      ? "Already in history"
      : "Save to history";

  return (
    <div className="space-y-6">
      <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] lg:gap-8">
          <div className="min-w-0">
            <ToolCardHeader slug={TOOL_SLUG} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Date of birth"
                type="date"
                name="birth"
                value={birth}
                max={isoToday()}
                onChange={(e) => setBirth(e.target.value)}
              />
              <Input
                label="Calculate age on"
                type="date"
                name="asOf"
                value={asOf}
                onChange={(e) => setAsOf(e.target.value)}
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

            {birth && asOf && !age && (
              <p className="mt-4 text-sm font-semibold text-destructive">
                The comparison date needs to be after the birth date.
              </p>
            )}

            <div className="mt-7 flex items-center gap-2 text-xs text-muted-foreground">
              <Calculator size={15} className="text-primary" />
              <span>Updates as you type · inclusive calendar calculation</span>
            </div>
          </div>

          {age ? (
            <ResultPanel title="Your age">
              <p className="ticker font-mono text-5xl font-medium tracking-[-.08em] text-foreground">
                {age.years}
                <span className="text-2xl text-muted-foreground">y</span>{" "}
                {age.months}
                <span className="text-2xl text-muted-foreground">m</span>{" "}
                {age.days}
                <span className="text-2xl text-muted-foreground">d</span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                That is {age.totalDays.toLocaleString()} days of lived time.
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
                <span className="text-xs text-muted-foreground">
                  As of {asOf ? dateLabel(localDate(asOf)) : "—"}
                </span>
                <CopyButton
                  value={`${age.years} years, ${age.months} months, ${age.days} days`}
                />
              </div>
            </ResultPanel>
          ) : (
            <ResultPanel empty>
              <p className="text-sm leading-6 text-muted-foreground">
                Add a birth date and a valid comparison date to see an exact age.
              </p>
            </ResultPanel>
          )}
        </div>
      </section>

      {breakdown && (
        <BreakdownCard
          title="Age breakdown"
          rows={[
            {
              label: "Age in Months",
              value: `${breakdown.months.total.toLocaleString()} months, ${
                breakdown.months.remainderWeeks
              } week${breakdown.months.remainderWeeks === 1 ? "" : "s"}, and ${
                breakdown.months.remainderDays
              } day${breakdown.months.remainderDays === 1 ? "" : "s"}`,
            },
            {
              label: "Age in Weeks",
              value: `${breakdown.weeks.total.toLocaleString()} weeks and ${
                breakdown.weeks.remainderDays
              } day${breakdown.weeks.remainderDays === 1 ? "" : "s"}`,
            },
            {
              label: "Age in Days",
              value: `${breakdown.days.toLocaleString()} days`,
            },
          ]}
        />
      )}
    </div>
  );
}