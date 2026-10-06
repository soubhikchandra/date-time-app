// src/components/layout/local-time-strip.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  Calendar,
  Clock,
  Globe,
  MapPin,
  Navigation,
  Sunrise,
  Sunset,
} from "lucide-react";
import {
  detectLocalZone,
  findCityForZone,
  formatTimeInZone,
  getSunDay,
  resolveCity,
} from "@/features/calculators/sunrise-sunset/logic";

/* ------------------------------------------------------------------ */
/*  Live ticker via useSyncExternalStore (SSR-safe)                    */
/* ------------------------------------------------------------------ */
const TICK_MS = 1000;

function subscribeTick(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const id = window.setInterval(cb, TICK_MS);
  return () => window.clearInterval(id);
}
const getTickClient = () => Math.floor(Date.now() / TICK_MS);
const getTickServer = () => 0;

/* ------------------------------------------------------------------ */
/*  SSR-safe mount flag                                                */
/* ------------------------------------------------------------------ */
const subscribeNoop = () => () => {};
const getMountedClient = () => true;
const getMountedServer = () => false;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ResolvedLocation {
  name: string;
  region: string;
  tz: string;
  lat: number;
  lng: number;
  source: "timezone" | "gps";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function LocalTimeStrip() {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getMountedClient,
    getMountedServer
  );

  const tick = useSyncExternalStore(subscribeTick, getTickClient, getTickServer);
  const now = useMemo(
    () => (tick === 0 ? null : new Date(tick * TICK_MS)),
    [tick]
  );

  const detectedLocation = useMemo<ResolvedLocation | null>(() => {
    if (!mounted) return null;
    try {
      const tz = detectLocalZone();
      const hit = findCityForZone(tz);
      if (!hit) return null;
      const record = resolveCity(hit.cityKey);
      if (!record) return null;
      return {
        name: record.city,
        region: [record.province?.trim(), record.country]
          .filter(Boolean)
          .join(", "),
        tz: record.timezone,
        lat: record.lat,
        lng: record.lng,
        source: "timezone",
      };
    } catch {
      return null;
    }
  }, [mounted]);

  const [gpsLocation, setGpsLocation] = useState<ResolvedLocation | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsDenied, setGpsDenied] = useState(false);

  const requestPrecise = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({
          name: "Your location",
          region: detectedLocation?.region ?? "",
          tz:
            detectedLocation?.tz ??
            Intl.DateTimeFormat().resolvedOptions().timeZone ??
            "UTC",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: "gps",
        });
        setGpsBusy(false);
      },
      () => {
        setGpsBusy(false);
        setGpsDenied(true);
      },
      { timeout: 5000, maximumAge: 60_000 }
    );
  };

  const location = gpsLocation ?? detectedLocation;

  const browserTz = useMemo(
    () =>
      mounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
    [mounted]
  );
  const tz = location?.tz ?? browserTz;

  if (!now) {
    return <div className="surface-card min-h-[72px]" aria-hidden="true" />;
  }

  const time = new Intl.DateTimeFormat(undefined, {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);

  const date = new Intl.DateTimeFormat(undefined, {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now);

  const offsetLabel =
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "longOffset",
    })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "";

  let sunrise: string | null = null;
  let sunset: string | null = null;

  if (location) {
    try {
      const ymd = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now);
      const [y, m, d] = ymd.split("-").map(Number);
      const localNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
      const sun = getSunDay(localNoon, location.lat, location.lng, tz);
      if (sun) {
        sunrise = formatTimeInZone(sun.sunrise, tz);
        sunset = formatTimeInZone(sun.sunset, tz);
      }
    } catch {
      /* optional */
    }
  }

  return (
    <div
      className="surface-card flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:gap-x-6 sm:gap-y-3 sm:px-5 sm:py-3.5"
      role="region"
      aria-label="Your local time and sun times"
    >
      {/* ---- Left: clock + location ---- */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:flex-none sm:gap-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-lg sm:size-10"
          style={{
            backgroundColor: "var(--purple-light)",
            color: "var(--purple)",
          }}
        >
          <Clock size={16} strokeWidth={2.2} className="sm:hidden" />
          <Clock size={18} strokeWidth={2.2} className="hidden sm:block" />
        </span>
        <div className="min-w-0">
          <p
            className="flex items-center gap-1.5 truncate text-[10px] font-bold uppercase tracking-[.16em] sm:text-[10.5px]"
            style={{ color: "var(--text-muted)" }}
          >
            <MapPin size={10} className="shrink-0 sm:hidden" />
            <MapPin size={11} className="hidden shrink-0 sm:block" />
            <span className="truncate">
              {location ? location.name : "Your timezone"}
            </span>
          </p>
          <p
            className="truncate font-mono text-[15px] font-extrabold leading-tight tracking-[-.02em] tabular-nums sm:text-[22px] sm:tracking-[-.03em]"
            style={{ color: "var(--text-primary)" }}
          >
            {time}
          </p>
        </div>
      </div>

      {/* ---- Middle + Right: single line, wraps only as a group on mobile ---- */}
      <div className="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] sm:w-auto sm:gap-x-4 sm:text-[13px]">
        <span
          className="inline-flex min-w-0 items-center gap-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          <Calendar size={12} style={{ color: "var(--text-muted)" }} className="shrink-0" />
          <span className="truncate">{date}</span>
        </span>

        <span
          className="inline-flex min-w-0 items-center gap-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          <Globe size={12} style={{ color: "var(--text-muted)" }} className="shrink-0" />
          <span className="truncate">{tz}</span>
        </span>

        {offsetLabel && (
          <span
            className="font-mono text-[10.5px] font-semibold sm:text-[12px]"
            style={{ color: "var(--purple)" }}
          >
            {offsetLabel}
          </span>
        )}

        {sunrise && (
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[11.5px] font-semibold sm:text-[13px]"
            style={{ color: "var(--text-primary)" }}
          >
            <Sunrise
              size={13}
              style={{ color: "#d97a1a" }}
              className="shrink-0"
            />
            {sunrise}
          </span>
        )}

        {sunset && (
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[11.5px] font-semibold sm:text-[13px]"
            style={{ color: "var(--text-primary)" }}
          >
            <Sunset
              size={13}
              style={{ color: "#c25c8a" }}
              className="shrink-0"
            />
            {sunset}
          </span>
        )}

        {location?.source === "timezone" && !gpsDenied && (
          <button
            type="button"
            onClick={requestPrecise}
            disabled={gpsBusy}
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold transition hover:brightness-[0.97] disabled:opacity-60 sm:px-2.5 sm:py-1 sm:text-[11px]"
            style={{
              borderColor: "var(--border-card)",
              color: "var(--text-secondary)",
            }}
            title="Use your device's precise location for exact sun times"
          >
            <Navigation size={10} className="shrink-0" />
            {gpsBusy ? "Locating…" : "Use precise location"}
          </button>
        )}
      </div>
    </div>
  );
}