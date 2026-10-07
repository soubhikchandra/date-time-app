// src/components/Home/country-search-hero.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ArrowRight, X } from "lucide-react";
import { COUNTRIES, type CountryData } from "@/lib/country-data";

const QUICK_CITIES = [
  { flag: "🇺🇸", city: "New York", code: "US" },
  { flag: "🇬🇧", city: "London", code: "GB" },
  { flag: "🇯🇵", city: "Tokyo", code: "JP" },
  { flag: "🇦🇺", city: "Sydney", code: "AU" },
  { flag: "🇨🇦", city: "Toronto", code: "CA" },
  { flag: "🇩🇪", city: "Berlin", code: "DE" },
  { flag: "🇫🇷", city: "Paris", code: "FR" },
  { flag: "🇦🇪", city: "Dubai", code: "AE" },
];

export function CountrySearchHero({
  onSelect,
}: {
  onSelect: (c: CountryData) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---- Outside click closes dropdown ---- */
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

  const commit = (c: CountryData) => {
    onSelect(c);
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
    if (matches.length === 0) {
      if (e.key === "Enter") inputRef.current?.blur();
      return;
    }
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
      commit(matches[activeIndex]);
    }
  };

  const handleQuickCity = (code: string) => {
    const hit = COUNTRIES.find((c) => c.code === code);
    if (hit) commit(hit);
  };

  return (
    <section
      className="rounded-2xl border p-4"
      style={{
        borderColor: "#C9E6DD",
        backgroundColor: "#E6F4EF",
        boxShadow: "0 8px 24px rgba(16, 44, 41, 0.05)",
      }}
    >
      {/* HEADER */}
      <div className="mb-3 flex items-start gap-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: "#FFFFFF", color: "#008F72" }}
        >
          <Search size={17} strokeWidth={2.4} />
        </span>
        <div className="min-w-0">
          <p
            className="text-[15px] font-extrabold leading-tight tracking-[-.01em]"
            style={{ color: "#102C29" }}
          >
            Check any country
          </p>
          <p
            className="mt-0.5 text-[11px] leading-snug sm:text-[12px]"
            style={{ color: "#4A6B66" }}
          >
            Search a country, city, or timezone to see live local details.
          </p>
        </div>
      </div>

      {/* SEARCH INPUT */}
      <div ref={containerRef} className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: "#607A76" }}
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
  aria-label="Search a country, city, or timezone"
  placeholder="Search a country, city, or timezone..."
  className="h-9 w-full rounded-full border bg-white pl-9 pr-9 text-[12.5px] outline-none transition placeholder:text-[#819490] focus:border-[#176B4F] focus:ring-[3px] focus:ring-[#176B4F]/15"
  style={{
    borderColor: "#C9E6DD",
    color: "#082501",
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
            className="absolute right-2.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full text-[#819490] transition hover:bg-[#E4F4EF] hover:text-[#008F72]"
          >
            <X size={11} />
          </button>
        )}

        {/* Dropdown */}
        {open && matches.length > 0 && (
          <ul
            className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 overflow-y-auto rounded-xl border bg-white p-1.5 shadow-2xl"
            style={{ borderColor: "#D9E8E3" }}
          >
            {matches.map((c, i) => (
              <li key={c.code}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => commit(c)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition"
                  style={
                    i === activeIndex
                      ? { backgroundColor: "#E4F4EF" }
                      : undefined
                  }
                >
                  <span className="text-[16px] leading-none">{c.flag}</span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-[12px] font-bold"
                      style={{ color: "#102C29" }}
                    >
                      {c.name}
                    </span>
                    <span
                      className="block truncate text-[10px]"
                      style={{ color: "#819490" }}
                    >
                      {c.city} · {c.tz}
                    </span>
                  </span>
                  <ArrowRight size={12} color="#819490" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* QUICK SEARCHES — green pills, white text */}
      <div className="mt-3">
        <p
          className="mb-1.5 text-[10px] font-semibold"
          style={{ color: "#4A6B66" }}
        >
          Quick searches:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_CITIES.map((c) => (
            <button
              key={c.code + c.city}
              type="button"
              onClick={() => handleQuickCity(c.code)}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold text-white transition hover:brightness-110 active:brightness-95"
              style={{ backgroundColor: "#008F72" }}
            >
              <span className="text-[11px] leading-none">{c.flag}</span>
              <span className="whitespace-nowrap">{c.city}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}