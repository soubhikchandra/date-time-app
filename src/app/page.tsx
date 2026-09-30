// import Link from "next/link";
// import { TOOLS } from "@/config/tools";

// export default function Home() {
//   return (
//     <div className="mx-auto max-w-[1120px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-12">
//       {/* Hero header */}
//       <header className="mb-9">
//         <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[.22em] text-primary">
//           <span className="size-1.5 rounded-full bg-accent" />
//           The answer is closer than you think
//         </p>

//         <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.02] tracking-[-.065em] text-foreground sm:text-5xl">
//           Date &amp; Time <span className="text-primary">Toolkit.</span>
//         </h1>

//         <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
//           {TOOLS.length} calculators — pick one to get started.
//         </p>
//       </header>

//       {/* Tools grid */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//         {TOOLS.map((tool) => {
//           const Icon = tool.icon;
//           return (
//             <Link
//               key={tool.slug}
//               href={`/tools/${tool.slug}`}
//               className="tool-card group rounded-3xl border border-border bg-card p-5 transition hover:border-primary/40"
//             >
//               <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
//                 <Icon size={18} strokeWidth={1.9} />
//               </div>
//               <h2 className="text-base font-bold text-foreground">
//                 {tool.name}
//               </h2>
//               <p className="mt-1 text-sm leading-6 text-muted-foreground">
//                 {tool.description}
//               </p>
//             </Link>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

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
  dates: "Dates",
  time: "Time",
  timezone: "Time & Place",
  timers: "Timers",
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
/*  Quick Tools card — right column of the hero                        */
/* ------------------------------------------------------------------ */
function QuickTools() {
  const quick = QUICK_SLUGS.map((slug) =>
    TOOLS.find((t) => t.slug === slug)
  ).filter(Boolean) as typeof TOOLS;

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_8px_30px_rgba(24,43,67,0.06)] sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-extrabold tracking-[-.02em] text-foreground">
          Quick Tools
        </h2>
        <Link
          href="#all-tools"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary transition hover:opacity-80"
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
              className="group flex flex-col justify-between gap-6 rounded-2xl border border-[#EEF6F3] bg-[#EEF6F3] p-4 transition hover:border-primary/30 hover:bg-[#E4F0EB]"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-white/80 text-primary">
                <Icon size={18} strokeWidth={1.9} />
              </span>
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold leading-tight text-foreground">
                  {tool.name}
                </span>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/80 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
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
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[0_2px_10px_rgba(24,43,67,0.04)] transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_10px_30px_rgba(24,43,67,0.08)]"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#EEF6F3] text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon size={19} strokeWidth={1.9} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-foreground">
          {tool.name}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground line-clamp-2">
          {tool.description}
        </span>
      </span>

      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#EEF6F3] text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        <ArrowRight size={13} />
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
    <div className="mx-auto max-w-[1240px] px-5 pb-16 pt-6 sm:px-8 sm:pt-10 lg:px-12">
      {/* ----------------------------------------------------------- */}
      {/* Hero + Quick Tools                                          */}
      {/* ----------------------------------------------------------- */}
      <section className="relative mb-8 grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.85fr)]">
        {/* Hero card */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#F1F7F4] via-[#EEF6F3] to-[#E8F2EE] p-6 sm:p-9">
          {/* soft decorative blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-10 -top-10 size-48 rounded-full bg-[#D9EEE7] opacity-70 blur-3xl" />
            <div className="absolute -bottom-16 right-16 h-40 w-72 rounded-[50%] bg-[#B9DDD2] opacity-60 blur-3xl" />
            <div className="absolute bottom-4 left-4 size-16 rounded-full bg-[#F5E8D5] opacity-70 blur-2xl" />
          </div>

          <div className="relative grid items-center gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[3px] text-primary">
                Simple · Accurate · Useful
              </p>

              <h1 className="text-[34px] font-extrabold leading-[1.1] tracking-[-.03em] text-foreground sm:text-[44px]">
                All Date &amp; Time Tools
                <br />
                <span className="text-primary">in One Place</span>
              </h1>

              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                Calculate, convert, and solve everyday date and time problems
                easily and quickly.
              </p>
            </div>

            {/* Illustration */}
            <div className="relative hidden h-56 items-center justify-center lg:flex">
              <div className="relative">
                {/* Clock */}
                <div className="grid size-32 place-items-center rounded-full border-[6px] border-white bg-[#287C80] shadow-[0_20px_40px_rgba(40,124,128,0.25)]">
                  <div className="relative grid size-24 place-items-center rounded-full bg-white">
                    <Clock3 size={38} className="text-[#287C80]" />
                    <span className="absolute right-3 top-3 size-2 rounded-full bg-[#18B99A]" />
                  </div>
                </div>

                {/* Calendar tile */}
                <div className="absolute -left-16 top-0 rotate-[-8deg] rounded-2xl border border-[#D5E5DF] bg-white p-3 shadow-[0_14px_30px_rgba(24,43,67,0.12)]">
                  <div className="mb-2 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-[#18B99A]" />
                    <span className="size-1.5 rounded-full bg-[#F5E8D5]" />
                    <span className="size-1.5 rounded-full bg-[#B9DDD2]" />
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "size-2 rounded-[3px]",
                          i === 5 ? "bg-[#287C80]" : "bg-[#EEF6F3]"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tools */}
        <QuickTools />
      </section>

      {/* ----------------------------------------------------------- */}
      {/* All Tools header + view toggle                              */}
      {/* ----------------------------------------------------------- */}
      <section id="all-tools" className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-[-.02em] text-foreground">
          All Date &amp; Time Tools
        </h2>

        <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Grid view"
            className={cn(
              "grid size-8 place-items-center rounded-lg transition",
              view === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
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
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List size={15} />
          </button>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/* Tool grid — grouped by category                             */}
      {/* ----------------------------------------------------------- */}
      <section className="space-y-8">
        {Object.entries(grouped).map(([category, tools]) => (
          <div key={category}>
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[.2em] text-muted-foreground">
              {CATEGORY_LABELS[category] ?? category}
            </p>

            <div
              className={cn(
                view === "grid"
                  ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid gap-2"
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
      <section className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-[0_8px_30px_rgba(24,43,67,0.06)] sm:flex-row sm:items-center sm:p-7">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#EEF6F3] text-primary">
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-base font-extrabold tracking-[-.02em] text-foreground">
              Every tool runs locally in your browser
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              No accounts required. Fast, private, and accurate.
            </p>
          </div>
        </div>

        <Link
          href="/tools/date-difference"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#13B998] to-[#20CFA5] px-5 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
        >
          <Wrench size={15} />
          Try a tool
        </Link>
      </section>
    </div>
  );
}