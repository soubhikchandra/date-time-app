// src/components/Home/popular-regions.tsx
"use client";

import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

const REGIONS = [
  { code: "US", flag: "🇺🇸", name: "United States" },
  { code: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "PE", flag: "🇵🇪", name: "Peru" },
];

export function PopularRegions() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          className="flex items-center gap-2 text-[17px] font-bold tracking-[-.02em]"
          style={{ color: "var(--text-primary)" }}
        >
          <MapPin size={16} style={{ color: "var(--purple)" }} />
          Popular Regions
        </h2>
        <Link
          href="/tools"
          className="inline-flex items-center gap-1 text-[12px] font-bold transition hover:opacity-80"
          style={{ color: "var(--purple)" }}
        >
          View all regions <ArrowRight size={12} />
        </Link>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {REGIONS.map((r) => (
          <Link
            key={r.code}
            href="#country-search"
            className="group flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 transition hover:-translate-y-[1px]"
            style={{
              borderColor: "var(--border-card)",
              boxShadow: "0 1px 3px rgba(16,44,41,0.04)",
            }}
          >
            <span className="text-[14px] leading-none">{r.flag}</span>
            <span
              className="text-[11px] font-bold"
              style={{ color: "var(--text-muted)" }}
            >
              {r.code}
            </span>
            <span
              className="whitespace-nowrap text-[12.5px] font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {r.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}