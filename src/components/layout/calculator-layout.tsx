// -----------------------------------------------------------------------------------
// components/layout/calculator-layout.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  CalendarPlus,
  Flame,
  Globe2,
} from "lucide-react";
import { AllToolsModal } from "./all-tools-modal";

interface CalculatorLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const POPULAR = [
  {
    slug: "age-calculator",
    name: "Age Calculator",
    desc: "Find your exact age",
    icon: Calendar,
    accent: "var(--accent-primary)",
    bg: "var(--accent-soft)",
  },
  {
    slug: "date-difference",
    name: "Date Difference",
    desc: "Find days between dates",
    icon: CalendarDays,
    accent: "#2E78F0",
    bg: "var(--row-months-bg)",
  },
  {
    slug: "add-days",
    name: "Add Days to Date",
    desc: "Add or subtract days",
    icon: CalendarPlus,
    accent: "#F04F96",
    bg: "var(--row-weeks-bg)",
  },
  {
    slug: "timezone-converter",
    name: "Time Zone Converter",
    desc: "Convert time zones",
    icon: Globe2,
    accent: "#F58A20",
    bg: "#FFF0DF",
  },
];

function AdSlot({ label = "Advertisement" }: { label?: string }) {
  return (
    <div className="surface-ad ad-slot w-full max-w-full" style={{ minHeight: 120 }}>
      <div className="flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-1.5 p-4 text-center">
        <span
          className="grid size-10 place-items-center rounded-xl"
          style={{
            backgroundColor: "var(--surface-card)",
            color: "var(--text-muted)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="9" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </span>
        <p
          className="text-[12px] font-semibold uppercase tracking-[.16em]"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export function CalculatorLayout({ children }: CalculatorLayoutProps) {
  const [allToolsOpen, setAllToolsOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-5 pt-5 sm:px-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] xl:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]">
        {/* LEFT */}
        <div className="min-w-0 space-y-4">
        {/* HERO ----------------------------------------------------- */}
<section
  className="hero-card relative overflow-hidden rounded-[20px] px-[clamp(12px,3vw,32px)] py-[clamp(16px,4vw,32px)]"
>
  {/* Flex layout keeps them side-by-side always, but allows perfect scaling */}
  <div className="relative flex items-center justify-between gap-[clamp(8px,2vw,32px)]">
    
    {/* LEFT: copy - Takes up remaining space (flex-1) */}
    <div className="relative z-10 flex-1 min-w-0">
      <p className="hero-eyebrow mb-[clamp(4px,1vw,12px)] text-[clamp(8px,1.2vw,11px)] font-bold uppercase tracking-[1.4px] sm:tracking-[1.8px]">
        Simple • Accurate • Useful
      </p>

      {/* Fluid font size: scales smoothly between 20px and 46px */}
      <h1 className="text-[clamp(20px,4vw,46px)] font-extrabold leading-[1.1] tracking-[-.02em]">
        <span className="hero-title-primary">Turn dates into</span>
        <br />
        <span className="hero-title-accent">meaningful answers.</span>
      </h1>

      {/* Fluid paragraph: scales smoothly between 11px and 16px */}
      <p className="hero-desc mt-[clamp(6px,1.5vw,16px)] text-[clamp(11px,1.6vw,16px)] leading-snug sm:leading-relaxed">
        Essential date & time tools for everyday planning.
      </p>
    </div>

    {/* RIGHT: illustration - Scales fluidly without getting too small or too big */}
    <div className="relative flex shrink-0 justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/watch.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        /* Fluid image: min 100px, scales at 22% of screen width, max 280px */
        className="hero-illustration h-auto w-[clamp(100px,22vw,280px)] select-none object-contain"
      />
    </div>
    
  </div>
</section>

          {/* CALCULATOR */}
          {children}

          {/* POPULAR TOOLS */}
          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-[#FFF0DF] text-[#F58A20]">
                  <Flame size={16} />
                </span>
                <div>
                  <h2
                    className="text-[18px] font-bold tracking-[-.02em]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Popular Tools
                  </h2>
                  <p
                    className="text-[12px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Most used date and time tools
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllToolsOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold transition hover:opacity-80"
                style={{ color: "var(--accent-primary)" }}
              >
                View all <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {POPULAR.map((p) => {
                const Icon = p.icon;
                return (
                  <Link
                    key={p.slug}
                    href={`/tools/${p.slug}`}
                    className="surface-card-soft group flex items-center gap-3 p-3 transition hover:brightness-105"
                  >
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl"
                      style={{ backgroundColor: p.bg, color: p.accent }}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block truncate text-[13px] font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {p.name}
                      </span>
                      <span
                        className="block truncate text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {p.desc}
                      </span>
                    </span>
                    <span
                      className="grid size-6 shrink-0 place-items-center rounded-full transition group-hover:brightness-105"
                      style={{ backgroundColor: p.bg, color: p.accent }}
                    >
                      <ArrowRight size={12} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT: ad column */}
        <aside className="flex h-full w-full flex-col gap-4">
          <div className="surface-card w-full p-3">
            <AdSlot label="Advertisement" />
          </div>
          <div className="surface-card w-full p-3">
            <AdSlot label="Advertisement" />
          </div>
          <div className="surface-card hidden w-full flex-1 p-3 lg:block">
            <div className="flex h-full w-full flex-col">
              <div className="flex-1">
                <AdSlot label="Sponsored" />
              </div>
            </div>
          </div>
        </aside>
      </div>

      <AllToolsModal
        isOpen={allToolsOpen}
        onClose={() => setAllToolsOpen(false)}
      />
    </div>
  );
}


// ------------------------------------------------------------------------------------------------------------------------------------------------

// When you wire in AdSense
// Replace the inner placeholder <div> in AdSlot with your ad unit:

// tsx
// function AdSlot({ label = "Advertisement" }: { label?: string }) {
//   return (
//     <div
//       className="ad-slot w-full max-w-full"
//       style={{
//         backgroundColor: "#F5F7FC",
//         border: "1px dashed #C8CEE8",
//         borderRadius: 16,
//         minHeight: 120,
//       }}
//     >
//       {/* <ins
//         className="adsbygoogle"
//         style={{ display: "block" }}
//         data-ad-client="ca-pub-XXXXXXXX"
//         data-ad-slot="XXXXXXXX"
//         data-ad-format="auto"
//         data-full-width-responsive="true"
//       /> */}
//       <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-1.5 p-4 text-center">
//         {/* current placeholder content */}
//       </div>
//     </div>
//   );
// }
// The outer container stays exactly as it is — width 100%, no fixed height. The ad network handles the actual sizing and format.
// ------------------------------------------------------------------------------------------------------------------------------------------------