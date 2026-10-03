"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { format, parseISO } from "date-fns";
import {
  Sunrise,
  Sunset,
  Sun,
  Clock3,
  Compass,
  Check,
  Copy,
} from "lucide-react";
import { ToolCardHeader } from "@/components/ui/tool-card-header";
import { ResultPanel } from "@/components/ui/result-card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import {
  detectLocalDate,
  detectLocalZone,
  findCityForZone,
  formatDuration,
  formatTimeInZone,
  getCityOptions,
  getCountryOptions,
  getStateOptions,
  getSunDay,
  getSunPosition,
  resolveCity,
} from "./logic";

const TOOL_SLUG = "sunrise-sunset";

/* ------------------------------------------------------------------ */
/*  Copy button                                                        */
/* ------------------------------------------------------------------ */

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
      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--purple)] transition hover:opacity-80"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Live tick                                                          */
/* ------------------------------------------------------------------ */

const TICK_MS = 1000;
function subscribeTick(cb: () => void) {
  const id = window.setInterval(cb, TICK_MS);
  return () => window.clearInterval(id);
}
const getTick = () => Math.floor(Date.now() / TICK_MS);
const getServerTick = () => 0;

/* ------------------------------------------------------------------ */
/*  Row component for sun events                                       */
/* ------------------------------------------------------------------ */

function SunEventRow({
  label,
  value,
  color = "text-muted-foreground",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] px-3 py-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn("font-mono text-[13px] font-semibold", color)}>
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function SunriseSunset() {
  const countryOptions = useMemo(() => getCountryOptions(), []);
  const localZone = useMemo(() => detectLocalZone(), []);

  /* Default to user's detected city */
  const initial = useMemo(() => {
    const hit = findCityForZone(localZone);
    if (!hit) return { country: "US", state: "California", city: "" };
    return {
      country: hit.countryIso2,
      state: hit.province,
      city: hit.cityKey,
    };
  }, [localZone]);

  const [country, setCountry] = useState(initial.country);
  const [state, setState] = useState(initial.state);
  const [city, setCity] = useState(initial.city);

  const [dateISO, setDateISO] = useState(
    format(detectLocalDate(), "yyyy-MM-dd")
  );

  const stateOptions = useMemo(() => getStateOptions(country), [country]);
  const cityOptions = useMemo(
    () => (state ? getCityOptions(country, state) : []),
    [country, state]
  );

  /* Cascading handlers */
  const handleCountry = (v: string) => {
    setCountry(v);
    const states = getStateOptions(v);
    const nextState = states[0]?.value ?? "";
    setState(nextState);
    const cities = nextState ? getCityOptions(v, nextState) : [];
    setCity(cities[0]?.value ?? "");
  };

  const handleState = (v: string) => {
    setState(v);
    const cities = getCityOptions(country, v);
    setCity(cities[0]?.value ?? "");
  };

  /* Selected city record */
  const cityRecord = useMemo(() => (city ? resolveCity(city) : null), [city]);

  /* Live tick */
  const tick = useSyncExternalStore(subscribeTick, getTick, getServerTick);
  const now = useMemo(
    () => (tick === 0 ? null : new Date(tick * TICK_MS)),
    [tick]
  );

  /* Parse selected date into a Date at local noon (avoid DST edge cases) */
  const selectedDate = useMemo(() => {
    try {
      const d = parseISO(dateISO);
      d.setHours(12, 0, 0, 0);
      return d;
    } catch {
      return new Date();
    }
  }, [dateISO]);

  /* Sun calculations */
  const sunDay = useMemo(() => {
    if (!cityRecord) return null;
    return getSunDay(
      selectedDate,
      cityRecord.lat,
      cityRecord.lng,
      cityRecord.timezone
    );
  }, [selectedDate, cityRecord]);

  /* Live sun position (only if selected date is today) */
  const sunPos = useMemo(() => {
    if (!cityRecord || !now) return null;
    const isToday =
      selectedDate.toDateString() === now.toDateString();
    if (!isToday) return null;
    return getSunPosition(now, cityRecord.lat, cityRecord.lng);
  }, [cityRecord, now, selectedDate]);

  /* Timezone-formatted times */
  const tz = cityRecord?.timezone ?? "UTC";

  return (
    <div className="space-y-4">
      <section className="tool-card rounded-3xl border border-[var(--border-card)] bg-[var(--surface-card)] p-5 sm:p-7">
        <ToolCardHeader slug={TOOL_SLUG} />

        {/* Filters — Country / State / City / Date */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SearchableSelect
            label="Country"
            value={country}
            onChange={handleCountry}
            options={countryOptions}
            placeholder="Country..."
          />

          <SearchableSelect
            label="State / Province"
            value={state}
            onChange={handleState}
            options={stateOptions}
            placeholder={stateOptions.length === 0 ? "No states" : "State..."}
            disabled={stateOptions.length === 0}
          />

          <SearchableSelect
            label="City"
            value={city}
            onChange={setCity}
            options={cityOptions}
            placeholder={cityOptions.length === 0 ? "No cities" : "City..."}
            disabled={cityOptions.length === 0}
          />

          <div className="grid gap-1.5">
            <label className="text-[13px] font-semibold text-[var(--text-primary)]">
              Date
            </label>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              className="h-[42px] w-full rounded-[10px] px-3.5 text-[15px] outline-none transition bg-[var(--surface-input)] text-[var(--text-input)] border border-[var(--border-input)]"
            />
          </div>
        </div>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.5fr)]">
          {/* LEFT: Main sunrise / sunset cards + timeline */}
          <div className="min-w-0">
            {sunDay && cityRecord ? (
              <div className="space-y-4">
                {/* Big two cards */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Sunrise card */}
                  <div className="rounded-2xl border border-amber-300/60 bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/5">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <Sunrise size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Sunrise
                      </span>
                    </div>
                    <p className="mt-3 font-mono text-[clamp(28px,7vw,40px)] font-bold leading-none tracking-[-.03em] text-[var(--text-primary)]">
                      {formatTimeInZone(sunDay.sunrise, tz)}
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Dawn {formatTimeInZone(sunDay.dawn, tz)} · Golden{" "}
                      {formatTimeInZone(sunDay.sunriseEnd, tz)}
                    </p>
                  </div>

                  {/* Sunset card */}
                  <div className="rounded-2xl border border-orange-300/60 bg-gradient-to-br from-orange-50 to-rose-50 p-5 dark:border-orange-500/30 dark:from-orange-500/10 dark:to-rose-500/5">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <Sunset size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Sunset
                      </span>
                    </div>
                    <p className="mt-3 font-mono text-[clamp(28px,7vw,40px)] font-bold leading-none tracking-[-.03em] text-[var(--text-primary)]">
                      {formatTimeInZone(sunDay.sunset, tz)}
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Golden {formatTimeInZone(sunDay.goldenHour, tz)} · Dusk{" "}
                      {formatTimeInZone(sunDay.dusk, tz)}
                    </p>
                  </div>
                </div>

                {/* Info strip — day length + solar noon + position */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
                    <div className="flex items-center gap-2 text-[var(--purple)]">
                      <Clock3 size={13} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Day length
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-[16px] font-bold text-[var(--text-primary)]">
                      {formatDuration(sunDay.dayLengthMinutes)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <Sun size={13} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Solar noon
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-[16px] font-bold text-[var(--text-primary)]">
                      {formatTimeInZone(sunDay.solarNoon, tz)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-3">
                    <div className="flex items-center gap-2 text-sky-600">
                      <Compass size={13} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Sun position
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-[16px] font-bold text-[var(--text-primary)]">
                      {sunPos
                        ? `${sunPos.compass} · ${Math.round(sunPos.altitude)}°`
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Detailed events grid */}
                <div className="rounded-xl border border-[var(--border-card)] bg-[var(--surface-card)] p-4">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    All Sun Events
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <SunEventRow
                      label="Astronomical dawn"
                      value={formatTimeInZone(sunDay.astronomicalDawn, tz)}
                    />
                    <SunEventRow
                      label="Astronomical dusk"
                      value={formatTimeInZone(sunDay.astronomicalDusk, tz)}
                    />
                    <SunEventRow
                      label="Nautical dawn"
                      value={formatTimeInZone(sunDay.nauticalDawn, tz)}
                    />
                    <SunEventRow
                      label="Nautical dusk"
                      value={formatTimeInZone(sunDay.nauticalDusk, tz)}
                    />
                    <SunEventRow
                      label="Civil dawn"
                      value={formatTimeInZone(sunDay.dawn, tz)}
                    />
                    <SunEventRow
                      label="Civil dusk"
                      value={formatTimeInZone(sunDay.dusk, tz)}
                    />
                    <SunEventRow
                      label="Sunrise"
                      value={formatTimeInZone(sunDay.sunrise, tz)}
                      color="text-amber-600 dark:text-amber-400"
                    />
                    <SunEventRow
                      label="Sunset"
                      value={formatTimeInZone(sunDay.sunset, tz)}
                      color="text-orange-600 dark:text-orange-400"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <ResultPanel empty>
                <p className="text-[13px] leading-6 text-muted-foreground">
                  Pick a country, state, and city to see sun times.
                </p>
              </ResultPanel>
            )}
          </div>

          {/* RIGHT: Location info + copy */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <ResultPanel title="Location">
              {cityRecord ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      City
                    </p>
                    <p className="mt-1 text-[14px] font-bold text-[var(--text-primary)]">
                      {cityRecord.city}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {cityRecord.province?.trim() || cityRecord.country},{" "}
                      {cityRecord.country}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        Latitude
                      </p>
                      <p className="mt-0.5 font-mono text-[12px] font-semibold text-[var(--text-primary)]">
                        {cityRecord.lat.toFixed(4)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        Longitude
                      </p>
                      <p className="mt-0.5 font-mono text-[12px] font-semibold text-[var(--text-primary)]">
                        {cityRecord.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[var(--border-card)] bg-[var(--surface-btn-secondary)] p-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      Timezone
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[12px] font-semibold text-[var(--text-primary)]">
                      {cityRecord.timezone}
                    </p>
                  </div>

                  {sunDay && (
                    <div className="border-t border-[var(--border-card)] pt-3">
                      <CopyButton
                        value={`Sunrise: ${formatTimeInZone(sunDay.sunrise, tz)}, Sunset: ${formatTimeInZone(sunDay.sunset, tz)} — ${cityRecord.city} on ${format(selectedDate, "PPP")}`}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[13px] text-muted-foreground">
                  No location selected.
                </p>
              )}
            </ResultPanel>
          </div>
        </div>
      </section>
    </div>
  );
}