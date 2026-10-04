// app/page.tsx
"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  LayoutGrid,
  List,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { TOOLS, getToolsByCategory } from "@/config/tools";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Category labels (matches sidebar)                                  */
/* ------------------------------------------------------------------ */
const CATEGORY_LABELS: Record<string, string> = {
  dates: "DATES",
  time: "TIME",
  timezone: "TIME & PLACE",
  timers: "TIMERS",
};

/* ------------------------------------------------------------------ */
/*  Pick the 4 tools shown as "Quick Tools"                            */
/* ------------------------------------------------------------------ */
const QUICK_SLUGS = [
  "date-difference",
  "age-calculator",
  "add-days",
  "week-number",
];

/* ------------------------------------------------------------------ */
/*  NEW: Hero Illustration — Floating UI Cards                        */
/* ------------------------------------------------------------------ */
function HeroIllustration() {
  return (
    <div className="relative hidden h-56 w-full items-center justify-center lg:flex">
      {/* Anchor wrapper — calendar flows in normal layout, so it can't escape upward */}
      <div className="relative">
        {/* Main Calendar Card */}
        <div className="w-40 rotate-[-8deg] rounded-2xl border border-[#E1E4F0] bg-white p-3 shadow-[0_15px_35px_rgba(48,57,120,0.12)] dark:border-[#28345A] dark:bg-[#151F38]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#10163D] dark:text-[#F2F4FF]">
              October 2026
            </span>
            <span className="size-1.5 rounded-full bg-[#5A4BC7] dark:bg-[#8A73FF]" />
          </div>
          <div className="grid grid-cols-7 gap-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span
                key={i}
                className="text-center text-[7px] font-bold text-[#7C87AA] dark:text-[#8792B8]"
              >
                {d}
              </span>
            ))}
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "flex size-4 items-center justify-center rounded-[4px] text-[8px] font-medium",
                  i === 14
                    ? "bg-[#5A4BC7] text-white dark:bg-[#6354E8]"
                    : i === 20
                      ? "bg-[#18BFA3] text-white"
                      : "text-[#10163D] dark:text-[#F2F4FF]"
                )}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>

        {/* Floating Time Card — positioned relative to the calendar, not the outer container */}
        <div className="absolute -bottom-6 -right-10 z-10 w-32 rotate-[6deg] rounded-2xl border border-[#E1E4F0] bg-white p-3 shadow-[0_15px_35px_rgba(48,57,120,0.12)] dark:border-[#28345A] dark:bg-[#151F38]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#7C87AA] dark:text-[#8792B8]">
              Local Time
            </span>
            <Clock3 size={11} className="text-[#5A4BC7] dark:text-[#8A73FF]" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="font-mono text-xl font-bold text-[#10163D] dark:text-[#F2F4FF]">
              10:42
            </span>
            <span className="font-mono text-[9px] font-bold text-[#7180A8] dark:text-[#929DC7]">
              AM
            </span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#EEF8F4] dark:bg-[#192C3A]">
            <div className="h-full w-2/3 rounded-full bg-[#18BFA3]" />
          </div>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="size-48 rounded-full bg-[#5A4BC7] opacity-10 blur-3xl dark:bg-[#6354E8] dark:opacity-20" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Tools card — right column of the hero                        */
/* ------------------------------------------------------------------ */
function QuickTools() {
  const quick = QUICK_SLUGS.map((slug) =>
    TOOLS.find((t) => t.slug === slug)
  ).filter(Boolean) as typeof TOOLS;

  return (
    <div className="rounded-3xl border border-[#E1E4F0] bg-white p-5 shadow-[0_8px_24px_rgba(48,57,120,0.07),0_2px_6px_rgba(48,57,120,0.04)] dark:border-[#28345A] dark:bg-[#111A31] sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[20px] font-bold tracking-[-.02em] text-[#10163D] dark:text-[#F2F4FF]">
          Quick Tools
        </h2>
        <Link
          href="#all-tools"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#5A4BC7] transition hover:opacity-80 dark:text-[#8A73FF]"
        >
          View all <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quick.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group flex min-h-[110px] flex-col justify-between gap-3 rounded-2xl border border-transparent bg-[#F0F7F4] p-3.5 transition hover:border-[#D6DAEB] hover:bg-[#FBFCFF] dark:bg-[#18243B] dark:hover:border-[#38466D] dark:hover:bg-[#151F3B]"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-white text-[#5A4BC7] dark:bg-[#202B48]">
                <Icon size={16} strokeWidth={1.9} />
              </span>
              <span className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-bold leading-tight text-[#10163D] dark:text-[#EDF0FF]">
                  {tool.name}
                </span>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#F5F3FF] text-[#5A4BC7] transition group-hover:bg-[#5A4BC7] group-hover:text-white dark:bg-[#20294A] dark:group-hover:bg-[#6354E8]">
                  <ArrowRight size={12} />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tool card — used in the "All Tools" grid                           */
/* ------------------------------------------------------------------ */
function ToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
  const Icon = tool.icon;
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex items-center gap-4 rounded-[18px] border border-[#E1E4F0] bg-white p-4 shadow-[0_6px_18px_rgba(48,57,120,0.05)] transition duration-200 hover:-translate-y-[1px] hover:border-[#D6DAEB] hover:bg-[#FBFCFF] dark:border-[#28345A] dark:bg-[#111A31] dark:shadow-[0_6px_18px_rgba(0,0,0,0.16)] dark:hover:border-[#38466D] dark:hover:bg-[#151F3B] sm:p-5"
    >
      <span className="grid size-[52px] shrink-0 place-items-center rounded-2xl bg-[#EEF8F4] text-[#5A4BC7] dark:bg-[#172C35]">
        <Icon size={22} strokeWidth={1.9} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-bold text-[#10163D] dark:text-[#F0F2FF]">
          {tool.name}
        </span>
        <span className="mt-0.5 block text-[14px] leading-5 text-[#7180A8] line-clamp-2 dark:text-[#929DC7]">
          {tool.description}
        </span>
      </span>

      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#F2F4FA] text-[#5A4BC7] transition group-hover:bg-[#5A4BC7] group-hover:text-white dark:bg-[#1B2745] dark:group-hover:bg-[#6354E8]">
        <ArrowRight size={14} />
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const grouped = getToolsByCategory();

  return (
    <div className="min-h-screen bg-[#EEF1FA] dark:bg-[#080D1F]">
      <div className="mx-auto max-w-[1480px] px-5 pb-16 pt-6 sm:px-8 sm:pt-10 lg:px-11">
        {/* ----------------------------------------------------------- */}
        {/* Hero + Quick Tools                                          */}
        {/* ----------------------------------------------------------- */}
        <section className="relative mb-8 grid items-stretch gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Hero card */}
          <div className="relative overflow-hidden rounded-3xl border border-[#DCE2EE] bg-gradient-to-br from-[#F7F6FF] via-[#F2F8F5] to-[#E5F4EF] p-6 shadow-[0_10px_30px_rgba(48,57,120,0.07)] dark:border-[rgba(120,130,210,0.25)] dark:from-[#151A3B] dark:via-[#182A45] dark:to-[#173E42] dark:shadow-[0_12px_32px_rgba(0,0,0,0.25)] sm:p-7">
            {/* soft decorative blobs matching spec */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-10 -top-10 size-40 rounded-full bg-[#D9EEE7] opacity-70 blur-3xl dark:bg-[rgba(99,84,232,0.28)] dark:opacity-100" />
              <div className="absolute -bottom-16 right-16 h-32 w-60 rounded-[50%] bg-[#B9DDD2] opacity-60 blur-3xl dark:bg-[rgba(32,201,151,0.10)] dark:opacity-100" />
              <div className="absolute bottom-4 left-4 size-16 rounded-full bg-[#F5E8D5] opacity-70 blur-2xl dark:hidden" />
            </div>

            <div className="relative grid items-center gap-5 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[1.8px] text-[#6047F5] dark:text-[#8D7CFF]">
                  Simple · Accurate · Useful
                </p>

                <h1 className="text-[32px] font-extrabold leading-[1.05] tracking-[-.03em] text-[#10163D] dark:text-[#F4F5FF] sm:text-[42px]">
                  All Date &amp; Time Tools
                  <br />
                  <span className="text-[#5A4BC7] dark:text-[#8A73FF]">
                    in One Place
                  </span>
                </h1>

                <p className="mt-3 max-w-[360px] text-[15px] leading-relaxed text-[#7180A8] dark:text-[#A3ADD0] sm:text-[16px]">
                  Calculate, convert, and solve everyday date and time problems
                  easily and quickly.
                </p>
              </div>

              {/* UPDATED: New Hero Illustration */}
              <HeroIllustration />
            </div>
          </div>

          {/* Quick Tools */}
          <QuickTools />
        </section>

        {/* ----------------------------------------------------------- */}
        {/* All Tools header + view toggle                              */}
        {/* ----------------------------------------------------------- */}
        <section id="all-tools" className="mb-4 flex items-center justify-between">
          <h2 className="text-[28px] font-bold tracking-[-.02em] text-[#10163D] dark:text-[#F2F4FF] sm:text-[32px]">
            All Date &amp; Time Tools
          </h2>

          <div className="inline-flex items-center gap-1 rounded-xl bg-[#F0F2FA] p-1 dark:bg-[#151F38]">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={cn(
                "grid size-8 place-items-center rounded-lg transition",
                view === "grid"
                  ? "bg-[#5A4BC7] text-white dark:bg-[#6354E8]"
                  : "text-[#7C87AA] hover:text-[#10163D] dark:text-[#8792B8] dark:hover:text-[#F2F4FF]"
              )}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              className={cn(
                "grid size-8 place-items-center rounded-lg transition",
                view === "list"
                  ? "bg-[#5A4BC7] text-white dark:bg-[#6354E8]"
                  : "text-[#7C87AA] hover:text-[#10163D] dark:text-[#8792B8] dark:hover:text-[#F2F4FF]"
              )}
            >
              <List size={15} />
            </button>
          </div>
        </section>

        {/* ----------------------------------------------------------- */}
        {/* Tool grid — grouped by category                             */}
        {/* ----------------------------------------------------------- */}
        <section className="space-y-10">
          {Object.entries(grouped).map(([category, tools]) => (
            <div key={category}>
              <p className="mb-3.5 font-mono text-[11px] font-bold uppercase tracking-[2px] text-[#7C87AA] dark:text-[#8792B8]">
                {CATEGORY_LABELS[category] ?? category}
              </p>

              <div
                className={cn(
                  view === "grid"
                    ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid gap-3"
                )}
              >
                {tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ----------------------------------------------------------- */}
        {/* Footer strip — "How it works" reminder                      */}
        {/* ----------------------------------------------------------- */}
        <section className="mt-12 flex flex-col items-start justify-between gap-5 rounded-3xl border border-[#E1E4F0] bg-white p-6 shadow-[0_8px_24px_rgba(48,57,120,0.07)] dark:border-[#28345A] dark:bg-[#111A31] sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-center gap-4">
            <span className="grid size-[60px] place-items-center rounded-2xl bg-[#EEF8F4] text-[#5A4BC7] dark:bg-[#192C3A]">
              <Sparkles size={22} />
            </span>
            <div>
              <p className="text-[18px] font-bold tracking-[-.02em] text-[#10163D] dark:text-[#F2F4FF]">
                Every tool runs locally in your browser
              </p>
              <p className="mt-1 text-[14px] text-[#7180A8] dark:text-[#929DC7] sm:text-[16px]">
                No accounts required. Fast, private, and accurate.
              </p>
            </div>
          </div>

          <Link
            href="/tools/date-difference"
            className="inline-flex h-[52px] shrink-0 items-center gap-2 rounded-2xl bg-[#18BFA3] px-6 text-sm font-bold text-white shadow-[0_6px_16px_rgba(24,191,163,0.20)] transition hover:bg-[#12A98F]"
          >
            <Wrench size={15} />
            Try a tool
          </Link>
        </section>
      </div>
    </div>
  );
}