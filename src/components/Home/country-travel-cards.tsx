// src/components/Home/country-travel-cards.tsx
"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { MapPin } from "lucide-react";
import { CountryTravelCard } from "./country-travel-card";
import type { CountryData } from "@/lib/country-data";   // ← ADD THIS

/* ---- DELETE the local interface CountryData { ... } ---- */

const FEATURED: CountryData[] = [
  { code: "US", flag: "🇺🇸", name: "United States", city: "New York", tz: "America/New_York", lat: 40.7128, lng: -74.006, currency: "USD", dial: "+1", languages: "English", population: "335M", region: "Americas" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", city: "London", tz: "Europe/London", lat: 51.5074, lng: -0.1278, currency: "GBP", dial: "+44", languages: "English", population: "68M", region: "Europe" },
  { code: "JP", flag: "🇯🇵", name: "Japan", city: "Tokyo", tz: "Asia/Tokyo", lat: 35.6762, lng: 139.6503, currency: "JPY", dial: "+81", languages: "Japanese", population: "123M", region: "Asia" },
  { code: "AU", flag: "🇦🇺", name: "Australia", city: "Sydney", tz: "Australia/Sydney", lat: -33.8688, lng: 151.2093, currency: "AUD", dial: "+61", languages: "English", population: "26M", region: "Oceania" },
];



const TICK_MS = 1000;
function subscribeTick(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const id = window.setInterval(cb, TICK_MS);
  return () => window.clearInterval(id);
}
const getTickClient = () => Math.floor(Date.now() / TICK_MS);
const getTickServer = () => 0;

const subscribeNoop = () => () => {};
const getMountedClient = () => true;
const getMountedServer = () => false;

export function CountryTravelCards() {
  const mounted = useSyncExternalStore(subscribeNoop, getMountedClient, getMountedServer);
  const tick = useSyncExternalStore(subscribeTick, getTickClient, getTickServer);
  const now = useMemo(() => (tick === 0 ? null : new Date(tick * TICK_MS)), [tick]);

  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    const currencies = [...new Set(FEATURED.map((c) => c.currency))].join(",");
    fetch(`https://api.frankfurter.app/latest?from=USD&to=${currencies}`)
      .then((r) => r.json())
      .then((d) => setRates(d.rates ?? {}))
      .catch(() => {});
  }, []);

  const userOffsetMin = useMemo(
    () => (mounted ? -new Date().getTimezoneOffset() : 0),
    [mounted]
  );

  if (!mounted || !now) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED.map((c) => (
          <div key={c.code} className="h-[420px] rounded-xl border"
            style={{ borderColor: "var(--border-card)", backgroundColor: "var(--surface-card)" }} />
        ))}
      </div>
    );
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-[20px] font-extrabold tracking-[-.02em]"
          style={{ color: "var(--text-primary)" }}>
          <MapPin size={18} style={{ color: "var(--purple)" }} />
          Time around the world
        </h2>
        <p className="mt-1 text-[13px]" style={{ color: "var(--text-muted)" }}>
          Live time, weather, currency, and sun times for popular destinations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED.map((c) => (
          <CountryTravelCard
            key={c.code}
            country={c}
            now={now}
            userOffsetMin={userOffsetMin}
            exchangeRate={rates[c.currency] ?? (c.currency === "USD" ? 1 : null)}
          />
        ))}
      </div>
    </section>
  );
}