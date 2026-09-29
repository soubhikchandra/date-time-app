"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Check, Copy, Hash, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-card";
import { BreakdownCard } from "@/components/ui/breakdown-card";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { useHistory } from "@/components/history/history-context";
import { isoToday } from "@/lib/date-time";
import {
  buildSnapshot,
  currentSeconds,
  parseDateTime,
  parseTimestamp,
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
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

const TOOL_SLUG = "unix-timestamp";

/* Stable live snapshot for the "current timestamp" strip */
function subscribeToSecond(cb: () => void) {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
}
const getSecond = () => currentSeconds();
const getServerSecond = () => 0;

type Mode = "timestamp" | "date";

function localTimeNow(): string {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function UnixTimestamp() {
  const [mode, setMode] = useState<Mode>("timestamp");

  // Timestamp → Date
  const [tsInput, setTsInput] = useState(String(currentSeconds()));

  // Date → Timestamp
  const [dateInput, setDateInput] = useState(isoToday());
  const [timeInput, setTimeInput] = useState(localTimeNow());

  const [justSaved, setJustSaved] = useState(false);
  const { addEntry, hasSignature } = useHistory();

  const liveSeconds = useSyncExternalStore(
    subscribeToSecond,
    getSecond,
    getServerSecond
  );

  const result = useMemo(() => {
    if (mode === "timestamp") {
      const d = parseTimestamp(tsInput);
      return d ? buildSnapshot(d) : null;
    }
    const d = parseDateTime(dateInput, timeInput);
    return d ? buildSnapshot(d) : null;
  }, [mode, tsInput, dateInput, timeInput]);

  const signature =
    mode === "timestamp"
      ? `ts:${tsInput}`
      : `dt:${dateInput}|${timeInput}`;

  const alreadySaved = hasSignature(TOOL_SLUG, signature);
  const canSave = Boolean(result) && !alreadySaved;

  const invalid =
    mode === "timestamp"
      ? tsInput.trim() !== "" && !result
      : dateInput && timeInput && !result;

  const saveToHistory = () => {
    if (!result || !canSave) return;
    addEntry({
      tool: TOOL_SLUG,
      toolName: "Unix Timestamp",
      signature,
      summary:
        mode === "timestamp"
          ? result.utcFormatted
          : `${result.seconds}`,
      details:
        mode === "timestamp"
          ? {
              Timestamp: String(result.seconds),
              UTC: result.utcFormatted,
              Local: result.localFormatted,
            }
          : {
              Input: `${dateInput} ${timeInput}`,
              Seconds: String(result.seconds),
              Milliseconds: String(result.milliseconds),
              ISO: result.iso,
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

  const setNow = () => {
    if (mode === "timestamp") {
      setTsInput(String(currentSeconds()));
    } else {
      const d = new Date();
      setDateInput(isoToday());
      setTimeInput(
        `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}`
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] lg:gap-8">
          {/* LEFT: header + form */}
          <div className="min-w-0">
            <ToolCardHeader slug={TOOL_SLUG} />

            {/* Mode tabs */}
            <div className="mb-5 inline-flex rounded-xl bg-muted p-1">
              <button
                type="button"
                onClick={() => setMode("timestamp")}
                className={
                  "rounded-lg px-3 py-2 text-xs font-bold transition " +
                  (mode === "timestamp"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                Timestamp → Date
              </button>
              <button
                type="button"
                onClick={() => setMode("date")}
                className={
                  "rounded-lg px-3 py-2 text-xs font-bold transition " +
                  (mode === "date"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                Date → Timestamp
              </button>
            </div>

            {mode === "timestamp" ? (
              <Input
                label="Unix timestamp"
                name="ts"
                inputMode="numeric"
                value={tsInput}
                onChange={(e) => setTsInput(e.target.value)}
                placeholder="1712345678"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Date"
                  type="date"
                  name="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                />
                <Input
                  label="Time"
                  type="time"
                  name="time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                />
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="ghost" onClick={setNow} className="min-h-9">
                Use now
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                onClick={saveToHistory}
                disabled={!canSave}
                className="min-h-10"
                title={
                  alreadySaved
                    ? "This exact conversion is already saved"
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
                {mode === "timestamp"
                  ? "Enter a whole number of seconds or milliseconds."
                  : "Enter a valid date and time."}
              </p>
            )}

            <div className="mt-7 flex items-start gap-2 text-xs text-muted-foreground">
              <Hash size={15} className="mt-0.5 shrink-0 text-primary" />
              <span>
                Seconds since 1 January 1970, UTC. Values under 100 billion
                are treated as seconds; larger as milliseconds.
              </span>
            </div>
          </div>

          {/* RIGHT: result */}
          {result ? (
            <ResultPanel
              title={mode === "timestamp" ? "Readable date" : "Unix timestamp"}
            >
              <p className="ticker font-mono text-lg font-medium leading-snug tracking-[-.03em] text-foreground sm:text-xl">
                {mode === "timestamp"
                  ? result.utcFormatted
                  : String(result.seconds)}
              </p>

              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>
                  <span className="font-mono uppercase tracking-[.18em] text-primary">
                    Local ·{" "}
                  </span>
                  {result.localFormatted}
                </p>
                <p className="ticker font-mono">{result.relative}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
                <span className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                  {result.localZone.replace("_", " ")}
                </span>
                <CopyButton
                  value={
                    mode === "timestamp"
                      ? result.utcFormatted
                      : String(result.seconds)
                  }
                />
              </div>
            </ResultPanel>
          ) : (
            <ResultPanel empty>
              <p className="text-sm leading-6 text-muted-foreground">
                {mode === "timestamp"
                  ? "Paste a Unix timestamp to decode it."
                  : "Pick a date and time to see its Unix timestamp."}
              </p>
            </ResultPanel>
          )}
        </div>
      </section>

      {/* Live reference strip */}
      <section className="tool-card flex items-center justify-between gap-4 rounded-3xl border border-border bg-card px-5 py-4 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Hash size={15} />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
              Current Unix timestamp
            </p>
            <p className="ticker font-mono text-lg font-medium text-foreground">
              {liveSeconds > 0 ? liveSeconds : "—"}
            </p>
          </div>
        </div>
        <CopyButton value={String(liveSeconds)} />
      </section>

      {/* Breakdown */}
      {result && (
        <BreakdownCard
          title="Conversion details"
          rows={[
            {
              label: "Unix seconds",
              value: String(result.seconds),
            },
            {
              label: "Unix milliseconds",
              value: String(result.milliseconds),
            },
            {
              label: "ISO 8601 (UTC)",
              value: result.iso,
            },
            {
              label: "UTC",
              value: result.utcFormatted,
            },
            {
              label: "Local",
              value: result.localFormatted,
            },
            {
              label: "Relative",
              value: result.relative,
            },
          ]}
        />
      )}
    </div>
  );
}