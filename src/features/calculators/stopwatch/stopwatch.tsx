"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Flag,
  Pause,
  Play,
  RotateCcw,
  Save,
  Timer,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-card";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { useHistory } from "@/components/history/history-context";
import { cn } from "@/lib/utils";
import {
  analyzeLaps,
  formatStopwatch,
  shortFormat,
  type Lap,
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

const TOOL_SLUG = "stopwatch";

type Status = "idle" | "running" | "paused";

export function Stopwatch() {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [anchor, setAnchor] = useState<number | null>(null);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [justSaved, setJustSaved] = useState(false);
  const { addEntry, hasSignature } = useHistory();

  // Interval — only runs while running. Date.now() is called inside the
  // setInterval callback (not during render), so purity is preserved.
  useEffect(() => {
    if (status !== "running" || anchor === null) return;
    const id = window.setInterval(() => {
      setElapsed(Date.now() - anchor);
    }, 50);
    return () => window.clearInterval(id);
  }, [status, anchor]);

  const lapsStats = useMemo(() => analyzeLaps(laps), [laps]);

  /* ---------------- Controls ---------------- */

  const start = () => {
    // Anchor = the wall-clock timestamp that corresponds to elapsed=0.
    setAnchor(Date.now() - elapsed);
    setStatus("running");
  };

  const pause = () => {
    setAnchor(null);
    setStatus("paused");
  };

  const resume = () => {
    setAnchor(Date.now() - elapsed);
    setStatus("running");
  };

  const reset = () => {
    setStatus("idle");
    setAnchor(null);
    setElapsed(0);
    setLaps([]);
  };

  const recordLap = () => {
    const total = elapsed;
    const previousTotal = laps.length ? laps[laps.length - 1].totalMs : 0;
    const lapMs = total - previousTotal;
    setLaps((prev) => [
      ...prev,
      { index: prev.length + 1, totalMs: total, lapMs },
    ]);
  };

  const removeLap = (index: number) => {
    setLaps((prev) => {
      const remaining = prev.filter((l) => l.index !== index);
      return remaining.map((lap, i) => {
        const previousTotal = i === 0 ? 0 : remaining[i - 1].totalMs;
        return {
          index: i + 1,
          totalMs: lap.totalMs,
          lapMs: lap.totalMs - previousTotal,
        };
      });
    });
  };

  /* ---------------- History ---------------- */

  const signature = `${laps.length}|${Math.round(elapsed)}`;
  const alreadySaved = hasSignature(TOOL_SLUG, signature);
  const canSave = status !== "running" && elapsed > 0 && !alreadySaved;

  const saveToHistory = () => {
    if (!canSave) return;
    addEntry({
      tool: TOOL_SLUG,
      toolName: "Stopwatch",
      signature,
      summary: formatStopwatch(elapsed),
      details: {
        Elapsed: formatStopwatch(elapsed),
        Laps: String(laps.length),
        ...(laps.length > 0
          ? { Fastest: shortFormat(lapsStats.fastestMs ?? 0) }
          : {}),
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

  const panelTitle =
    status === "running"
      ? "Running"
      : status === "paused"
        ? "Paused"
        : elapsed > 0
          ? "Stopped"
          : "Ready";

  return (
    <div className="space-y-6">
      <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] lg:gap-8">
          {/* LEFT: header + controls */}
          <div className="min-w-0">
            <ToolCardHeader slug={TOOL_SLUG} />

            <div className="flex flex-wrap items-center gap-2">
              {status === "idle" && (
                <Button onClick={start} className="min-h-10">
                  <Play size={15} />
                  Start
                </Button>
              )}

              {status === "running" && (
                <>
                  <Button onClick={pause} className="min-h-10">
                    <Pause size={15} />
                    Pause
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={recordLap}
                    className="min-h-10"
                  >
                    <Flag size={15} />
                    Lap
                  </Button>
                </>
              )}

              {status === "paused" && (
                <>
                  <Button onClick={resume} className="min-h-10">
                    <Play size={15} />
                    Resume
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={recordLap}
                    className="min-h-10"
                  >
                    <Flag size={15} />
                    Lap
                  </Button>
                </>
              )}

              {status !== "idle" && (
                <Button
                  variant="secondary"
                  onClick={reset}
                  className="min-h-10"
                >
                  <RotateCcw size={15} />
                  Reset
                </Button>
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
                    ? "This exact run is already saved"
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
              <Timer size={15} className="mt-0.5 shrink-0 text-primary" />
              <span>
                Measures elapsed time from the wall clock — accurate even
                after the tab sleeps. Laps track split times.
              </span>
            </div>
          </div>

          {/* RIGHT: display */}
          <ResultPanel title={panelTitle}>
            <p className="ticker font-mono text-4xl font-medium tracking-[-.06em] text-foreground sm:text-5xl">
              {formatStopwatch(elapsed)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {laps.length === 0
                ? "No laps recorded yet."
                : `${laps.length} lap${laps.length === 1 ? "" : "s"} recorded.`}
            </p>

            <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                {status === "running"
                  ? "Live"
                  : status === "paused"
                    ? "Frozen"
                    : "Idle"}
              </span>
              <CopyButton value={formatStopwatch(elapsed)} />
            </div>
          </ResultPanel>
        </div>
      </section>

      {/* Laps */}
      {laps.length > 0 && (
        <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[.2em] text-primary">
              Laps
            </p>
            <button
              type="button"
              onClick={() => setLaps([])}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-destructive"
            >
              <Trash2 size={12} />
              Clear laps
            </button>
          </div>

          <ul className="divide-y divide-border">
            {laps.map((lap) => {
              const isFastest = lap.index === lapsStats.fastestIndex;
              const isSlowest = lap.index === lapsStats.slowestIndex;
              return (
                <li
                  key={lap.index}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg font-mono text-[11px] font-bold",
                        isFastest
                          ? "bg-accent/20 text-accent"
                          : isSlowest
                            ? "bg-destructive/15 text-destructive"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {lap.index}
                    </span>
                    <div className="min-w-0">
                      <p className="ticker font-mono text-sm text-foreground">
                        {formatStopwatch(lap.lapMs)}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                        Split
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="ticker font-mono text-sm text-foreground">
                        {formatStopwatch(lap.totalMs)}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                        Total
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLap(lap.index)}
                      aria-label={`Remove lap ${lap.index}`}
                      className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {laps.length >= 2 && lapsStats.fastestMs !== null && (
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-xs">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-accent" />
                Fastest:{" "}
                <span className="font-mono text-foreground">
                  {formatStopwatch(lapsStats.fastestMs)}
                </span>
              </span>
              {lapsStats.slowestMs !== null && (
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-destructive" />
                  Slowest:{" "}
                  <span className="font-mono text-foreground">
                    {formatStopwatch(lapsStats.slowestMs)}
                  </span>
                </span>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}