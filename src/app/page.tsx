// app/page.tsx
"use client";

import Link from "next/link";
import { getToolsByCategory, TOOLS } from "@/config/tools";
import { AdSlot } from "@/components/ads/ad-slot";

/* ------------------------------------------------------------------ */
/*  Category meta                                                      */
/* ------------------------------------------------------------------ */
const CATEGORY_META: Record<string, string> = {
  dates: "Dates",
  time: "Time",
  timezone: "Time Zones",
  timers: "Timers",
};

/* ------------------------------------------------------------------ */
/*  Tool link — icon + name + short description                        */
/* ------------------------------------------------------------------ */
function ToolLink({
  slug,
  name,
  description,
  icon: Icon,
}: {
  slug: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}) {
  return (
    <li>
      <Link
        href={`/tools/${slug}`}
        className="group flex items-start gap-3 rounded-lg px-2.5 py-2.5 transition hover:bg-[var(--surface-btn-secondary)]"
      >
        {/* Icon */}
        <span
          className="mt-[3px] grid size-8 shrink-0 place-items-center rounded-lg"
          style={{
            backgroundColor: "var(--purple-light)",
            color: "var(--purple)",
          }}
        >
          <Icon size={17} strokeWidth={2.2} />
        </span>

        {/* Text block */}
        <span className="min-w-0 flex-1">
          <span
            className="block text-[16px] font-semibold leading-snug transition group-hover:underline"
            style={{ color: "var(--purple)" }}
          >
            {name}
          </span>
          <span
            className="mt-0.5 block text-[14px] leading-snug line-clamp-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </span>
        </span>
      </Link>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Category box — uniform height, scrolls internally                  */
/* ------------------------------------------------------------------ */
function CategoryBox({
  category,
  tools,
}: {
  category: string;
  tools: (typeof TOOLS)[number][];
}) {
  const label = CATEGORY_META[category] ?? category;

  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border p-5"
      style={{
        borderColor: "var(--border-card)",
        backgroundColor: "var(--surface-card)",
        boxShadow: "var(--shadow-card)",
        height: "440px",
      }}
    >
      {/* Title */}
      <h2
        className="mb-3 shrink-0 text-[22px] font-extrabold tracking-[-.02em]"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
      </h2>

      {/* Tool list — fills remaining space, scrolls vertically only */}
      <ul className="category-scroll min-h-0 flex-1 space-y-0.5 pr-1.5">
        {tools.map((t) => (
          <ToolLink
            key={t.slug}
            slug={t.slug}
            name={t.name}
            description={t.description}
            icon={t.icon}
          />
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const grouped = getToolsByCategory();

  // Sort categories by tool count — biggest first, smallest last.
  const categories = Object.keys(grouped).sort(
    (a, b) =>
      (grouped[b] as (typeof TOOLS)[number][]).length -
      (grouped[a] as (typeof TOOLS)[number][]).length
  );

  return (
    <div className="pb-10">
      {/* ============================================================ */}
      {/* TOP AD — same width + padding as the navbar                  */}
      {/* ============================================================ */}
      <div className="mx-auto max-w-[1600px] px-3 pt-5 sm:px-4">
        <AdSlot type="top" />
      </div>

      {/* ============================================================ */}
      {/* CONTENT — narrower container, below the ad                   */}
      {/* ============================================================ */}
      <div className="mx-auto mt-5 max-w-[1400px] px-4 sm:px-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_336px]">
          {/* ---------------- MAIN COLUMN ---------------- */}
          <div className="min-w-0 space-y-6">
            <header>
              <h1
                className="text-[clamp(26px,3.4vw,38px)] font-extrabold tracking-[-.02em]"
                style={{ color: "var(--text-primary)" }}
              >
                All Date &amp; Time Tools
              </h1>
              <p
                className="mt-1.5 max-w-[720px] text-[16px] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Calculate, convert, and solve everyday date and time problems.
              </p>
            </header>

            <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((cat) => (
                <CategoryBox
                  key={cat}
                  category={cat}
                  tools={grouped[cat] as (typeof TOOLS)[number][]}
                />
              ))}
            </div>

            <AdSlot type="in-content" />
          </div>

          {/* ---------------- SIDEBAR ---------------- */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <AdSlot type="sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}