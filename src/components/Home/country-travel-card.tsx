// src/components/Home/country-travel-card.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Sunrise,
  Sunset,
  Clock,
  Globe,
  Calendar,
  Cloud,
  Wind,
  DollarSign,
  Phone,
  Languages,
  Sun,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import * as SunCalc from "suncalc";
import { getWeekendDays, isWeekend } from "country-weekends";
import * as noaaGfs from "noaa-gfs-js";
import type { CountryData } from "@/lib/country-data";   // ← ADD THIS

/* ---- DELETE the local interface CountryData { ... } ---- */

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  iconKind: "emoji" | "url";
  high: number;
  low: number;
  wind: number;
  source: "weatherapi" | "noaa";
}

/* ... rest of the file stays exactly the same ... */

/* ------------------------------------------------------------------ */
/*  In-memory cache                                                    */
/* ------------------------------------------------------------------ */
const CACHE_TTL_MS = 10 * 60 * 1000;
const weatherCache = new Map<string, { data: WeatherData; ts: number }>();

function getCached(key: string): WeatherData | null {
  const e = weatherCache.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL_MS) {
    weatherCache.delete(key);
    return null;
  }
  return e.data;
}

function setCache(key: string, data: WeatherData) {
  weatherCache.set(key, { data, ts: Date.now() });
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getOffsetMinutes(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
  });
  const s =
    dtf.formatToParts(date).find((p) => p.type === "timeZoneName")?.value ??
    "GMT+0";
  const m = s.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

function formatDiff(diffMin: number): string {
  if (diffMin === 0) return "Same as you";
  const abs = Math.abs(diffMin);
  const h = Math.floor(abs / 60);
  const mm = abs % 60;
  const parts = [h && `${h}h`, mm && `${mm}m`].filter(Boolean).join(" ") || "0m";
  return diffMin > 0 ? `${parts} ahead` : `${parts} behind`;
}

/* ------------------------------------------------------------------ */
/*  Weather fallback: WeatherAPI → NOAA GFS → placeholder              */
/* ------------------------------------------------------------------ */
const WEATHERAPI_KEY = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;

async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = getCached(key);
  if (cached) return cached;

  // 1. WeatherAPI.com (primary)
  if (WEATHERAPI_KEY) {
    try {
      const r = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_KEY}&q=${lat},${lng}&aqi=no`
      );
      if (r.ok) {
        const d = await r.json();
        const w: WeatherData = {
          temp: Math.round(d.current.temp_c),
          condition: d.current.condition.text,
          icon: `https:${d.current.condition.icon}`,
          iconKind: "url",
          high: Math.round(d.current.temp_c + 3),
          low: Math.round(d.current.temp_c - 3),
          wind: Math.round(d.current.wind_kph),
          source: "weatherapi",
        };
        setCache(key, w);
        return w;
      }
      // 429 / other status → fall through to NOAA
    } catch {
      /* fall through */
    }
  }

  // 2. NOAA GFS (fallback — temperature only)
  try {
    const dateStr = new Date().toISOString().split("T")[0].replaceAll("-", "");
    const res = await noaaGfs.get_gfs_data(
      "0p25",
      dateStr,
      "00",
      [lat, lat],
      [lng, lng],
      1,
      "tmp2m",
      true
    );
    const kelvin = res?.[0]?.value;
    if (kelvin && Number.isFinite(kelvin)) {
      const w: WeatherData = {
        temp: Math.round(kelvin - 273.15),
        condition: "N/A",
        icon: "❓",
        iconKind: "emoji",
        high: Math.round(kelvin - 273.15) + 2,
        low: Math.round(kelvin - 273.15) - 2,
        wind: 0,
        source: "noaa",
      };
      setCache(key, w);
      return w;
    }
  } catch {
    /* fall through */
  }

  // 3. Placeholder
  return {
    temp: 0,
    condition: "Unavailable",
    icon: "❓",
    iconKind: "emoji",
    high: 0,
    low: 0,
    wind: 0,
    source: "noaa",
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function CountryTravelCard({
  country,
  now,
  userOffsetMin,
  exchangeRate,
}: {
  country: CountryData;
  now: Date;
  userOffsetMin: number;
  exchangeRate: number | null;
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const loading = weather === null;

  useEffect(() => {
    let cancelled = false;
    fetchWeather(country.lat, country.lng).then((w) => {
      if (!cancelled) setWeather(w);
    });
    return () => {
      cancelled = true;
    };
  }, [country.lat, country.lng]);

  /* ---- Time & date ---- */
  const time = formatInTimeZone(now, country.tz, "hh:mm a");
  const date = formatInTimeZone(now, country.tz, "EEE, MMM d, yyyy");

  const tzShort =
    new Intl.DateTimeFormat("en-US", {
      timeZone: country.tz,
      timeZoneName: "short",
    })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "";

  const offsetLabel =
    new Intl.DateTimeFormat("en-US", {
      timeZone: country.tz,
      timeZoneName: "longOffset",
    })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "";

  /* ---- Time difference vs user ---- */
  const diff = getOffsetMinutes(now, country.tz) - userOffsetMin;

  /* ---- DST status ---- */
  const seven = new Date(now.getTime() + 7 * 86400_000);
  const dstChange =
    getOffsetMinutes(now, country.tz) !== getOffsetMinutes(seven, country.tz);
  const dstLabel = dstChange
    ? getOffsetMinutes(seven, country.tz) >
      getOffsetMinutes(now, country.tz)
      ? "DST starts this week"
      : "DST ends this week"
    : "";

  /* ---- Weekend logic ---- */
  const weekendDays = getWeekendDays(country.code);
  const weekendLabel =
    weekendDays.length === 2
      ? weekendDays[0] === 5
        ? "Fri – Sat"
        : "Sat – Sun"
      : weekendDays[0] === 5
        ? "Fri only"
        : weekendDays[0] === 0
          ? "Sun only"
          : "Unknown";
  const todayIsWeekend = isWeekend(now, country.code);

  /* ---- Sun times (guarded against polar day/night nulls) ---- */
  const ymd = formatInTimeZone(now, country.tz, "yyyy-MM-dd");
  const [y, m, d] = ymd.split("-").map(Number);
  const sun = SunCalc.getTimes(
    new Date(Date.UTC(y, m - 1, d, 12)),
    country.lat,
    country.lng
  );

  const hasSunTimes =
    sun.sunrise instanceof Date &&
    !Number.isNaN(sun.sunrise.getTime()) &&
    sun.sunset instanceof Date &&
    !Number.isNaN(sun.sunset.getTime());

  const sunrise = hasSunTimes
    ? formatInTimeZone(sun.sunrise as Date, country.tz, "hh:mm a")
    : null;
  const sunset = hasSunTimes
    ? formatInTimeZone(sun.sunset as Date, country.tz, "hh:mm a")
    : null;

  const dayLenMin = hasSunTimes
    ? Math.round(
        ((sun.sunset as Date).getTime() - (sun.sunrise as Date).getTime()) /
          60000
      )
    : 0;
  const dayLenLabel = hasSunTimes
    ? `${Math.floor(dayLenMin / 60)}h ${dayLenMin % 60}m`
    : "Polar";

  return (
    <div
      className="flex flex-col rounded-xl border p-4"
      style={{
        borderColor: "var(--border-card)",
        backgroundColor: "var(--surface-card)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header: flag + name + city */}
      <div className="mb-3 flex items-center gap-2.5">
        <span className="text-[24px] leading-none">{country.flag}</span>
        <div className="min-w-0">
          <p
            className="truncate text-[14px] font-bold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {country.name}
          </p>
          <p
            className="truncate text-[11px] leading-tight"
            style={{ color: "var(--text-muted)" }}
          >
            {country.city}
          </p>
        </div>
      </div>

      {/* Time + date */}
      <p
        className="font-mono text-[24px] font-extrabold leading-none tracking-[-.02em] tabular-nums"
        style={{ color: "var(--text-primary)" }}
      >
        {time}
      </p>
      <p className="mt-0.5 text-[12px]" style={{ color: "var(--text-muted)" }}>
        {date}
      </p>

      {/* TZ + diff + weekend */}
      <div className="mt-3 space-y-1 text-[11.5px]">
        <div
          className="flex items-center gap-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          <Globe size={12} style={{ color: "var(--text-muted)" }} />
          <span>
            {tzShort} · {offsetLabel}
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 font-semibold"
          style={{ color: "var(--purple)" }}
        >
          <Clock size={12} />
          <span>{formatDiff(diff)}</span>
        </div>
        <div
          className="flex items-center gap-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          <Calendar size={12} style={{ color: "var(--text-muted)" }} />
          <span>Weekend: {weekendLabel}</span>
          {todayIsWeekend && (
            <span
              className="ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: "var(--purple-light)",
                color: "var(--purple)",
              }}
            >
              NOW
            </span>
          )}
        </div>
        {dstLabel && (
          <div
            className="flex items-center gap-1.5 text-[11px]"
            style={{ color: "#d97a1a" }}
          >
            <Sun size={11} />
            <span>{dstLabel}</span>
          </div>
        )}
      </div>

      {/* Weather */}
      <div
        className="mt-3 rounded-lg border p-2.5"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "var(--surface-card-soft)",
        }}
      >
        {loading ? (
          <div
            className="flex items-center justify-center gap-1.5 py-1 text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            <Cloud size={12} />
            <span>Loading weather…</span>
          </div>
        ) : weather ? (
          <>
            <div className="flex items-center justify-between">
              <span
                className="inline-flex items-center gap-1.5 text-[15px] font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {weather.iconKind === "url" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={weather.icon}
                    alt={weather.condition}
                    width={28}
                    height={28}
                    className="shrink-0 select-none"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-[20px] leading-none">
                    {weather.icon}
                  </span>
                )}
                {weather.temp}°C
              </span>
              <span
                className="text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                {weather.condition}
              </span>
            </div>
            <div
              className="mt-1.5 flex items-center justify-between text-[11px]"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>
                H: {weather.high}° · L: {weather.low}°
              </span>
              <span className="inline-flex items-center gap-1">
                <Wind size={11} /> {weather.wind} km/h
              </span>
            </div>
            {weather.source === "noaa" && (
              <p
                className="mt-1 text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                Source: NOAA GFS (limited data)
              </p>
            )}
          </>
        ) : null}
      </div>

      {/* Sun times */}
      <div
        className="mt-3 flex items-center justify-between gap-2 border-t pt-2.5 text-[11px]"
        style={{ borderColor: "var(--border-soft)" }}
      >
        {hasSunTimes ? (
          <>
            <span
              className="inline-flex items-center gap-1"
              style={{ color: "var(--text-primary)" }}
            >
              <Sunrise size={12} style={{ color: "#d97a1a" }} />
              <span className="font-mono">{sunrise}</span>
            </span>
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              {dayLenLabel}
            </span>
            <span
              className="inline-flex items-center gap-1"
              style={{ color: "var(--text-primary)" }}
            >
              <span className="font-mono">{sunset}</span>
              <Sunset size={12} style={{ color: "#c25c8a" }} />
            </span>
          </>
        ) : (
          <span
            className="w-full text-center text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            Polar day / night — no sunrise or sunset
          </span>
        )}
      </div>

      {/* Currency + dial + languages */}
      <div
        className="mt-3 space-y-1 border-t pt-2.5 text-[11px]"
        style={{ borderColor: "var(--border-soft)" }}
      >
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            <DollarSign size={11} style={{ color: "var(--text-muted)" }} />
            <span>
              1 USD = {exchangeRate ? exchangeRate.toFixed(2) : "—"}{" "}
              {country.currency}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            <Phone size={11} style={{ color: "var(--text-muted)" }} />
            <span>{country.dial}</span>
          </span>
          <span
            className="inline-flex items-center gap-1.5 truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            <Languages size={11} style={{ color: "var(--text-muted)" }} />
            <span className="truncate">{country.languages}</span>
          </span>
        </div>
      </div>
    </div>
  );
}