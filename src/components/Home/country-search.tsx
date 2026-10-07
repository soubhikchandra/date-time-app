// src/components/Home/country-search.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Search, X, MapPin, ArrowRight } from "lucide-react";
import { CountryTravelCard } from "./country-travel-card";
import { COUNTRIES, REGION_LABELS, type CountryData } from "@/lib/country-data";

/* ------------------------------------------------------------------ */
/*  Live ticker — SSR-safe                                             */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function CountrySearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CountryData | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [rates, setRates] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---- Ticker + user offset (no setState in effect) ---- */
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

  /* ---- Fetch currency rates once ---- */
  useEffect(() => {
    const currencies = [...new Set(COUNTRIES.map((c) => c.currency))].join(",");
    fetch(`https://api.frankfurter.app/latest?from=USD&to=${currencies}`)
      .then((r) => r.json())
      .then((d) => setRates(d.rates ?? {}))
      .catch(() => {});
  }, []);

  /* ---- Close dropdown on outside click ---- */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* ---- Filter countries as user types ---- */
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q ||
        c.city.toLowerCase().includes(q) ||
        c.tz.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  /* ---- Related countries (same region, exclude self) ---- */
  const related = useMemo(() => {
    if (!selected) return [];
    return COUNTRIES.filter(
      (c) => c.region === selected.region && c.code !== selected.code
    ).slice(0, 3);
  }, [selected]);

  const handleSelect = (c: CountryData) => {
    setSelected(c);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(matches[activeIndex]);
    }
  };

  return (
    <section className="space-y-4">
      {/* Heading */}
      <div>
        <h2
          className="flex items-center gap-2 text-[20px] font-extrabold tracking-[-.02em]"
          style={{ color: "var(--text-primary)" }}
        >
          <Search size={18} style={{ color: "var(--purple)" }} />
          Check any country
        </h2>
        <p className="mt-1 text-[13px]" style={{ color: "var(--text-muted)" }}>
          Search a country, city, or timezone to see live local details.
        </p>
      </div>

      {/* Search input + dropdown */}
      <div ref={containerRef} className="relative max-w-[640px]">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search a country, city, or timezone..."
          className="h-11 w-full rounded-full border pl-11 pr-10 text-[14px] outline-none transition focus:ring-2"
          style={{
            borderColor: "var(--border-card)",
            backgroundColor: "var(--surface-card)",
            color: "var(--text-primary)",
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full transition hover:brightness-95"
            style={{
              backgroundColor: "var(--surface-btn-secondary)",
              color: "var(--text-muted)",
            }}
          >
            <X size={13} />
          </button>
        )}

        {open && matches.length > 0 && (
          <ul
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border p-1.5 shadow-2xl"
            style={{
              backgroundColor: "var(--surface-card)",
              borderColor: "var(--border-card)",
            }}
          >
            {matches.map((c, i) => (
              <li key={c.code}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => handleSelect(c)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition"
                  style={
                    i === activeIndex
                      ? { backgroundColor: "var(--purple-light)" }
                      : undefined
                  }
                >
                  <span className="text-[20px] leading-none">{c.flag}</span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-[13px] font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {c.name}
                    </span>
                    <span
                      className="block truncate text-[11px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {c.city} · {c.tz}
                    </span>
                  </span>
                  <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {open && query.trim() && matches.length === 0 && (
          <div
            className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border p-4 text-[13px] shadow-2xl"
            style={{
              backgroundColor: "var(--surface-card)",
              borderColor: "var(--border-card)",
              color: "var(--text-muted)",
            }}
          >
            No countries match &ldquo;{query}&rdquo;.
          </div>
        )}
      </div>

      {/* Selected card + related */}
      {selected && now ? (
        <div className="space-y-4">
          <div className="max-w-[380px]">
            <CountryTravelCard
              country={selected}
              now={now}
              userOffsetMin={userOffsetMin}
              exchangeRate={
                rates[selected.currency] ??
                (selected.currency === "USD" ? 1 : null)
              }
            />
          </div>

          {related.length > 0 && (
            <div>
              <p
                className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.16em]"
                style={{ color: "var(--text-muted)" }}
              >
                <MapPin size={11} />
                Related in {REGION_LABELS[selected.region] ?? selected.region}
              </p>
              <div className="flex flex-wrap gap-2">
                {related.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition hover:brightness-[0.97]"
                    style={{
                      borderColor: "var(--border-card)",
                      backgroundColor: "var(--surface-card)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span className="text-[14px] leading-none">{c.flag}</span>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="rounded-xl border border-dashed p-6 text-center text-[13px]"
          style={{
            borderColor: "var(--border-card)",
            color: "var(--text-muted)",
          }}
        >
          Search above to see details for any country.
        </div>
      )}
    </section>
  );
}