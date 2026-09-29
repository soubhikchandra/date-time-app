"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  Check,
  Copy,
  Hourglass,
  Pause,
  Play,
  RotateCcw,
  Save,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-card";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { useHistory } from "@/components/history/history-context";
import {
  computeCountdown,
  parseDateTime,
  PRESETS,
  summarize,
  toIso,
  toTime,
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

const TOOL_SLUG = "countdown";

/* Live tick — SSR-safe */
function subscribeTick(cb: () => void) {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
}
const getSecond = () => Math.floor(Date.now() / 1000);
const getServerSecond = () => 0;

function defaultTarget(): { date: string; time: string } {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 5);
  return { date: toIso(d), time: toTime(d) };
}

type Status = "idle" | "running" | "paused";

export function Countdown() {
  const initial = useMemo(() => defaultTarget(), []);
  const [dateInput, setDateInput] = useState(initial.date);
  const [timeInput, setTimeInput] = useState(initial.time);
  const [justSaved, setJustSaved] = useState(false);
  const { addEntry, hasSignature } = useHistory();

  // Runtime state
  const [status, setStatus] = useState<Status>("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [pausedAt, setPausedAt] = useState<number | null>(null);

  // Live second from the store.
  const second = useSyncExternalStore(
    subscribeTick,
    getSecond,
    getServerSecond
  );

  const target = useMemo(
    () => parseDateTime(dateInput, timeInput),
    [dateInput, timeInput]
  );

  // "now" depends on status.
  const now = useMemo(() => {
    if (status === "idle") return null;
    if (status === "paused" && pausedAt !== null)
      return new Date(pausedAt * 1000);
    return second > 0 ? new Date(second * 1000) : null;
  }, [status, pausedAt, second]);

  // Origin for the progress bar — when Start was pressed.
  const origin = useMemo(
    () => (startedAt !== null ? new Date(startedAt * 1000) : null),
    [startedAt]
  );

  const parts = useMemo(
    () => (target && now ? computeCountdown(target, origin, now) : null),
    [target, now, origin]
  );

  const signature = `${dateInput}|${timeInput}`;
  const alreadySaved = hasSignature(TOOL_SLUG, signature);
  const canSave = Boolean(parts) && !alreadySaved;

  /* ---------------- Controls ---------------- */

  const start = () => {
    if (!target) return;
    setStartedAt(Math.floor(Date.now() / 1000));
    setPausedAt(null);
    setStatus("running");
  };

  const pause = () => {
    setPausedAt(Math.floor(Date.now() / 1000));
    setStatus("paused");
  };

  const resume = () => {
    setPausedAt(null);
    setStatus("running");
  };

  const reset = () => {
    setStatus("idle");
    setStartedAt(null);
    setPausedAt(null);
    const d = defaultTarget();
    setDateInput(d.date);
    setTimeInput(d.time);
  };

  const applyPreset = (label: string) => {
    const preset = PRESETS.find((p) => p.label === label);
    if (!preset) return;
    const t = preset.target(new Date());
    setStatus("idle");
    setStartedAt(null);
    setPausedAt(null);
    setDateInput(toIso(t));
    setTimeInput(toTime(t));
  };

  const changeTarget = () => {
    setStatus("idle");
    setStartedAt(null);
    setPausedAt(null);
  };

  const saveToHistory = () => {
    if (!parts || !canSave || !target) return;
    addEntry({
      tool: TOOL_SLUG,
      toolName: "Countdown",
      signature,
      summary: parts.expired
        ? "Expired"
        : `${parts.days}d ${parts.hours}h ${parts.minutes}m`,
      details: {
        Target: `${dateInput} ${timeInput}`,
        Remaining: parts.expired ? "0" : summarize(parts).replace("in ", ""),
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

  /* Panel title */
  const panelTitle = parts?.expired
    ? "Expired"
    : status === "idle"
      ? "Ready"
      : status === "paused"
        ? "Paused"
        : "Counting down";

  return (
    <div className="space-y-6">
      <section className="tool-card rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)] lg:gap-8">
          {/* LEFT: header + form */}
          <div className="min-w-0">
            <ToolCardHeader slug={TOOL_SLUG} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Target date"
                type="date"
                name="date"
                value={dateInput}
                disabled={status === "running"}
                onChange={(e) => {
                  changeTarget();
                  setDateInput(e.target.value);
                }}
              />
              <Input
                label="Target time"
                type="time"
                name="time"
                value={timeInput}
                disabled={status === "running"}
                onChange={(e) => {
                  changeTarget();
                  setTimeInput(e.target.value);
                }}
              />
            </div>

            {/* Presets */}
            <div className="mt-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                Quick set
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.label)}
                    disabled={status === "running"}
                    className="rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:opacity-40"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {status === "idle" && (
                <Button onClick={start} disabled={!target} className="min-h-10">
                  <Play size={15} />
                  Start
                </Button>
              )}

              {status === "running" && (
                <Button onClick={pause} className="min-h-10">
                  <Pause size={15} />
                  Pause
                </Button>
              )}

              {status === "paused" && (
                <Button onClick={resume} className="min-h-10">
                  <Play size={15} />
                  Resume
                </Button>
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
                    ? "This exact countdown is already saved"
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
              <Hourglass size={15} className="mt-0.5 shrink-0 text-primary" />
              <span>
                Keeps counting even when the tab is in the background — the
                timer is derived from the clock, not a tick counter.
              </span>
            </div>
          </div>

          {/* RIGHT: result */}
          <ResultPanel title={panelTitle}>
            {status === "idle" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 opacity-50">
                  <Unit value={0} label="days" />
                  <Unit value={0} label="hrs" />
                  <Unit value={0} label="min" />
                  <Unit value={0} label="sec" />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {target
                    ? "Press Start to begin the countdown."
                    : "Enter a valid target date and time, then press Start."}
                </p>
              </div>
            ) : parts ? (
              <>
                <div className="grid grid-cols-4 gap-2">
                  <Unit value={parts.days} label="days" />
                  <Unit value={parts.hours} label="hrs" />
                  <Unit value={parts.minutes} label="min" />
                  <Unit value={parts.seconds} label="sec" />
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {parts.expired
                    ? "Target time has passed."
                    : summarize(parts)}
                </p>

                {parts.progress !== null && (
                  <div className="mt-5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                        style={{ width: `${parts.progress}%` }}
                      />
                    </div>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                      {parts.progress.toFixed(1)}% elapsed
                    </p>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                    {dateInput} · {timeInput}
                  </span>
                  <CopyButton
                    value={
                      parts.expired
                        ? "Expired"
                        : `${parts.days}d ${parts.hours}h ${parts.minutes}m ${parts.seconds}s`
                    }
                  />
                </div>
              </>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Choose a valid target date and time, then press Start.
              </p>
            )}
          </ResultPanel>
        </div>
      </section>
    </div>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-primary/15 bg-primary/[.06] px-2 py-3 text-center">
      <p className="ticker font-mono text-2xl font-medium leading-none tracking-[-.05em] text-foreground sm:text-3xl">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}