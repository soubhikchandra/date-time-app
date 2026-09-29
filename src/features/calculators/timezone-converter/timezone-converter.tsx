"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Copy, Globe2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-card";
import { BreakdownCard } from "@/components/ui/breakdown-card";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { useHistory } from "@/components/history/history-context";
import { isoToday } from "@/lib/date-time";
import {
  convertTimezone,
  TIMEZONE_GROUPS,
  TIMEZONE_ALIASES,
  TIMEZONES,
  findTimezone,
  type TimezoneGroup,
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

const TOOL_SLUG = "timezone-converter";

function detectLocalZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function labelFor(zone: string): string {
  return findTimezone(zone)?.label ?? zone;
}

export function TimezoneConverter() {
  const detected = detectLocalZone();
  const canonical = TIMEZONE_ALIASES[detected] ?? detected;

  const [date, setDate] = useState(isoToday());
  const [time, setTime] = useState("09:00");
  const [from, setFrom] = useState(canonical);
  const [to, setTo] = useState("Europe/London");
  const [justSaved, setJustSaved] = useState(false);
  const { addEntry, hasSignature } = useHistory();

  const result = useMemo(
    () => convertTimezone(date, time, from, to),
    [date, time, from, to]
  );

  const signature = `${date}|${time}|${from}|${to}`;
  const alreadySaved = hasSignature(TOOL_SLUG, signature);
  const canSave = Boolean(result) && !alreadySaved;

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const saveToHistory = () => {
    if (!result || !canSave) return;
    addEntry({
      tool: TOOL_SLUG,
      toolName: "Time Zone Converter",
      signature,
      summary: result.formatted,
      details: {
        From: `${date} ${time} — ${labelFor(from)}`,
        To: labelFor(to),
        Offset: result.offset,
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

  // If the detected zone isn't in our list, prepend it as a "Detected" group.
  const fromGroups = useMemo<TimezoneGroup[]>(() => {
    const exists = TIMEZONES.some((z) => z.value === from);
    if (exists) return TIMEZONE_GROUPS;
    return [
      {
        label: "Detected",
        options: [{ value: from, label: `${from} (detected)` }],
      },
      ...TIMEZONE_GROUPS,
    ];
  }, [from]);

  return (
    <div className="space-y-6">
      <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] lg:gap-8">
          {/* LEFT: header + form */}
          <div className="min-w-0">
            <ToolCardHeader slug={TOOL_SLUG} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Date"
                type="date"
                name="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                label="Time"
                type="time"
                name="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <Select
                label="From"
                name="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                groups={fromGroups}
              />
              <button
                type="button"
                onClick={swap}
                aria-label="Swap zones"
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-background/70 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <ArrowRight size={16} className="hidden sm:block" />
                <ArrowRight size={16} className="rotate-90 sm:hidden" />
              </button>
              <Select
                label="To"
                name="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                groups={TIMEZONE_GROUPS}
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

            <div className="mt-7 flex items-start gap-2 text-xs text-muted-foreground">
              <Globe2 size={15} className="mt-0.5 shrink-0 text-primary" />
              <span>
                Uses your browser&apos;s IANA time zone database. DST is
                applied automatically.
              </span>
            </div>
          </div>

          {/* RIGHT: result */}
          {result ? (
            <ResultPanel title="Converted time">
              <p className="font-mono text-2xl font-medium leading-snug tracking-[-.03em] text-foreground">
                {result.formatted}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {result.abbreviation} · {result.offset}
                {result.dayShift !== 0 && (
                  <>
                    {" · "}
                    <span className="font-semibold text-primary">
                      {result.dayShift > 0 ? "+" : "−"}
                      {Math.abs(result.dayShift)} day
                      {Math.abs(result.dayShift) === 1 ? "" : "s"}
                    </span>
                  </>
                )}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
                <span className="text-xs text-muted-foreground">
                  Same instant, new wall clock
                </span>
                <CopyButton value={result.formatted} />
              </div>
            </ResultPanel>
          ) : (
            <ResultPanel empty>
              <p className="text-sm leading-6 text-muted-foreground">
                Pick a date, time, and two zones to translate the moment.
              </p>
            </ResultPanel>
          )}
        </div>
      </section>

      {result && (
        <BreakdownCard
          title="Conversion details"
          rows={[
            {
              label: "Source",
              value: `${date} ${time} — ${labelFor(from)}`,
            },
            {
              label: "Target",
              value: `${labelFor(to)}`,
            },
            {
              label: "Converted",
              value: result.formatted,
            },
            {
              label: "Zone abbreviation",
              value: result.abbreviation,
            },
            {
              label: "UTC offset",
              value: result.offset,
            },
            {
              label: "Day shift",
              value:
                result.dayShift === 0
                  ? "Same day"
                  : `${result.dayShift > 0 ? "+" : "−"}${Math.abs(
                      result.dayShift
                    )} day${Math.abs(result.dayShift) === 1 ? "" : "s"}`,
            },
          ]}
        />
      )}
    </div>
  );
}