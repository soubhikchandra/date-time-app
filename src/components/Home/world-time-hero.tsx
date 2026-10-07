// src/components/Home/world-time-hero.tsx
"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { X, MapPin } from "lucide-react";
import { CountryTravelCards } from "./country-travel-cards";
import { CountryTravelCard } from "./country-travel-card";
import { CountrySearchHero } from "./country-search-hero";
import { COUNTRIES, REGION_LABELS, type CountryData } from "@/lib/country-data";

/* ---- Ticker ---- */
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

export function WorldTimeHero() {
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
  const userOffsetMin = useMemo(
    () => (mounted ? -new Date().getTimezoneOffset() : 0),
    [mounted]
  );

  const [selected, setSelected] = useState<CountryData | null>(null);
  const [rates, setRates] = useState<Record<string, number>>({});

  /* ---- Currency rates ---- */
  useEffect(() => {
    const currencies = [...new Set(COUNTRIES.map((c) => c.currency))].join(",");
    fetch(`https://api.frankfurter.app/latest?from=USD&to=${currencies}`)
      .then((r) => r.json())
      .then((d) => setRates(d.rates ?? {}))
      .catch(() => {});
  }, []);

  /* ---- Esc closes modal ---- */
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  /* ---- Lock body scroll ---- */
  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selected]);

  const related = useMemo(() => {
    if (!selected) return [];
    return COUNTRIES.filter(
      (c) => c.region === selected.region && c.code !== selected.code
    ).slice(0, 3);
  }, [selected]);

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl">
        {/* Desktop map */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{
            backgroundImage: "url('/desk-map.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center right",
            backgroundSize: "contain",
            opacity: 0.25,
          }}
        />
        {/* Mobile map */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 md:hidden"
          style={{
            backgroundImage: "url('/mobile-map.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center top",
            backgroundSize: "contain",
            opacity: 0.2,
          }}
        />

        <div className="relative z-10 space-y-6 px-2 py-8 sm:px-4 sm:py-10 md:py-12">
          {/* Hero copy + search panel */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_560px] md:items-start">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[.14em]"
                style={{ color: "var(--purple)" }}
              >
                Global Time • Weather • Time Zones
              </p>
              <h1
                className="mt-2 text-[clamp(32px,5vw,54px)] font-extrabold leading-[1] tracking-[-.03em]"
                style={{ color: "var(--text-primary)" }}
              >
                Time around
                <br />
                <span style={{ color: "var(--purple)" }}>the world</span>
              </h1>
              <p
                className="mt-3 max-w-[400px] text-[14px] leading-relaxed sm:text-[15px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Live time, weather, currency, and sun times for popular
                destinations.
              </p>
            </div>

            {/* NEW — compact search panel */}
            <CountrySearchHero onSelect={setSelected} />
          </div>

          {/* 4 world time cards */}
          <CountryTravelCards />
        </div>
      </section>

      {/* ---- Search result popup ---- */}
      {selected && now && mounted && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 pt-16 sm:items-center sm:pt-4"
              role="dialog"
              aria-modal="true"
              aria-label={`Details for ${selected.name}`}
            >
              <div
                onClick={() => setSelected(null)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                aria-hidden="true"
              />

              <div
                className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl"
                style={{
                  backgroundColor: "var(--surface-page)",
                  border: "1px solid var(--border-card)",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.28)",
                }}
              >
                <div
                  className="flex items-center justify-between gap-3 border-b px-5 py-4"
                  style={{
                    borderColor: "var(--border-card)",
                    backgroundColor: "var(--surface-card)",
                  }}
                >
                  <p
                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.16em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <MapPin size={12} style={{ color: "var(--purple)" }} />
                    Search result — {selected.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    aria-label="Close"
                    className="grid size-8 shrink-0 place-items-center rounded-full transition hover:brightness-95"
                    style={{
                      backgroundColor: "var(--surface-btn-secondary)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4 p-5">
                  <CountryTravelCard
                    country={selected}
                    now={now}
                    userOffsetMin={userOffsetMin}
                    exchangeRate={
                      rates[selected.currency] ??
                      (selected.currency === "USD" ? 1 : null)
                    }
                  />

                  {related.length > 0 && (
                    <div>
                      <p
                        className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.16em]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <MapPin size={11} />
                        Related in{" "}
                        {REGION_LABELS[selected.region] ?? selected.region}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {related.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => setSelected(c)}
                            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-[12.5px] font-semibold transition hover:-translate-y-[1px]"
                            style={{
                              borderColor: "var(--border-card)",
                              color: "var(--text-primary)",
                            }}
                          >
                            <span className="text-[14px] leading-none">
                              {c.flag}
                            </span>
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}