"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { Clock3, Moon, Plus, Save, Sun, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ResultPanel } from "@/components/ui/result-card";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { useHistory } from "@/components/history/history-context";
import { TIMEZONE_GROUPS } from "@/features/calculators/timezone-converter/logic";
import {
  DEFAULT_CITIES,
  detectLocalZone,
  getSnapshot,
  type WorldClockEntry,
} from "./logic";

const TOOL_SLUG = "world-clock";

/* ------------------------------------------------------------------ */
/*  Live clock — SSR-safe via useSyncExternalStore                     */
/* ------------------------------------------------------------------ */

function subscribeToTick(callback: () => void) {
  const id = window.setInterval(callback, 1000);
  return () => window.clearInterval(id);
}

function getSecondSnapshot() {
  return Math.floor(Date.now() / 1000);
}

// Server always renders the "loading" value (0). Client takes over after hydration.
function getServerSecondSnapshot() {
  return 0;
}

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                    */
/* ------------------------------------------------------------------ */

function loadStoredCities(): WorldClockEntry[] | null {
  try {
    const raw = window.localStorage.getItem("dtt-world-clock-cities");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as WorldClockEntry[];
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function WorldClock() {
  const localZone = useMemo(() => detectLocalZone(), []);
  const [cities, setCities] = useState<WorldClockEntry[]>(() => {
    if (typeof window === "undefined") return DEFAULT_CITIES;
    const stored = loadStoredCities();
    return stored && stored.length > 0 ? stored : DEFAULT_CITIES;
  });
  const [adding, setAdding] = useState(false);
  const [pickZone, setPickZone] = useState("America/Toronto");
  const [pickLabel, setPickLabel] = useState("Toronto");
  const [justSaved, setJustSaved] = useState(false);
  const { addEntry, hasSignature } = useHistory();

  // Second snapshot — stable across server + client hydration.
  const second = useSyncExternalStore(
    subscribeToTick,
    getSecondSnapshot,
    getServerSecondSnapshot
  );

  // Only build a Date once we're past the placeholder (second > 0).
  const now = useMemo(
    () => (second === 0 ? null : new Date(second * 1000)),
    [second]
  );

  // Persist to storage
  useEffect(() => {
    try {
      window.localStorage.setItem(
        "dtt-world-clock-cities",
        JSON.stringify(cities)
      );
    } catch {
      /* storage blocked */
    }
  }, [cities]);

  const addCity = () => {
    const label = pickLabel.trim() || pickZone.split("/").pop() || pickZone;
    const entry: WorldClockEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      city: label,
      country: "",
      zone: pickZone,
    };
    if (!cities.some((c) => c.zone === pickZone)) {
      setCities([...cities, entry]);
    }
    setAdding(false);
  };

  const removeCity = (id: string) => {
    setCities(cities.filter((c) => c.id !== id));
  };

  const resetDefaults = () => setCities(DEFAULT_CITIES);

  const signature = cities.map((c) => c.zone).join(",");
  const alreadySaved = hasSignature(TOOL_SLUG, signature);
  const canSave = cities.length > 0 && !alreadySaved && now !== null;

  const saveToHistory = () => {
    if (!canSave || !now) return;
    addEntry({
      tool: TOOL_SLUG,
      toolName: "World Clock",
      signature,
      summary: `${cities.length} cities`,
      details: Object.fromEntries(
        cities.map((c) => {
          const s = getSnapshot(now, c.zone, localZone);
          return [c.city, `${s.time} ${s.abbreviation}`];
        })
      ),
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
          {/* LEFT: header + city list */}
          <div className="min-w-0">
            <ToolCardHeader slug={TOOL_SLUG} />

            <ul className="space-y-2">
              {cities.map((c) => {
                const s = now ? getSnapshot(now, c.zone, localZone) : null;
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                          s?.isDaytime
                            ? "bg-accent/15 text-accent"
                            : "bg-primary/15 text-primary"
                        }`}
                      >
                        {s?.isDaytime ? (
                          <Sun size={15} />
                        ) : (
                          <Moon size={15} />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {c.city}
                        </p>
                        <p className="truncate font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                          {s?.abbreviation ?? "—"} · {s?.offset ?? "—"}
                          {s && s.dayShift !== 0 && (
                            <>
                              {" · "}
                              {s.dayShift > 0 ? "+" : "−"}
                              {Math.abs(s.dayShift)}d
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <p className="ticker font-mono text-sm text-foreground sm:text-base">
                        {s ? s.time : "--:--:--"}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeCity(c.id)}
                        aria-label={`Remove ${c.city}`}
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-destructive"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Add city */}
            <div className="mt-5">
              {adding ? (
                <div className="rounded-2xl border border-border bg-background/60 p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Select
                      label="Zone"
                      value={pickZone}
                      onChange={(e) => setPickZone(e.target.value)}
                      groups={TIMEZONE_GROUPS}
                    />
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="city-label"
                        className="text-sm font-bold text-foreground"
                      >
                        Label
                      </label>
                      <input
                        id="city-label"
                        type="text"
                        value={pickLabel}
                        onChange={(e) => setPickLabel(e.target.value)}
                        placeholder="City name"
                        className="h-11 w-full rounded-xl border border-input bg-background/70 px-3.5 text-sm text-foreground shadow-sm transition placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button onClick={addCity} className="min-h-9">
                      <Plus size={14} /> Add city
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setAdding(false)}
                      className="min-h-9"
                    >
                      <X size={14} /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setAdding(true)}
                    className="min-h-9"
                  >
                    <Plus size={14} /> Add city
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={resetDefaults}
                    className="min-h-9"
                  >
                    Reset to defaults
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                onClick={saveToHistory}
                disabled={!canSave}
                className="min-h-10"
              >
                {justSaved || alreadySaved ? (
                  <Clock3 size={15} />
                ) : (
                  <Save size={15} />
                )}
                {buttonLabel}
              </Button>
            </div>

            <div className="mt-7 flex items-start gap-2 text-xs text-muted-foreground">
              <Clock3 size={15} className="mt-0.5 shrink-0 text-primary" />
              <span>
                Ticks live, every second. Your city list is saved in your
                browser.
              </span>
            </div>
          </div>

          {/* RIGHT: hero local clock */}
          <ResultPanel title="Your time">
            {now ? (
              <>
                <p className="ticker font-mono text-4xl font-medium tracking-[-.06em] text-foreground sm:text-5xl">
                  {getSnapshot(now, localZone, localZone).timeShort}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {getSnapshot(now, localZone, localZone).weekday},{" "}
                  {getSnapshot(now, localZone, localZone).date}
                </p>
              </>
            ) : (
              <p className="ticker font-mono text-4xl font-medium tracking-[-.06em] text-muted-foreground sm:text-5xl">
                --:-- --
              </p>
            )}
            <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                {localZone.replace("_", " ")}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                {cities.length} cities
              </span>
            </div>
          </ResultPanel>
        </div>
      </section>
    </div>
  );
}