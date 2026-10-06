// src/components/layout/calculator-layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { getToolsByCategory, TOOLS } from "@/config/tools";
import { AdSlot } from "@/components/ads/ad-slot";
import { LocalTimeStrip } from "./local-time-strip";

interface CalculatorLayoutProps {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  children: React.ReactNode;
}

const CATEGORY_LABELS: Record<string, string> = {
  dates: "Date Calculations",
  time: "Time",
  timezone: "Time & Place",
  timers: "Timers",
};

/* ------------------------------------------------------------------ */
/*  Related Tools — same category, excludes the current tool            */
/* ------------------------------------------------------------------ */
function RelatedTools({ currentSlug }: { currentSlug: string | null }) {
  if (!currentSlug) return null;

  const current = TOOLS.find((t) => t.slug === currentSlug);
  if (!current) return null;

  const grouped = getToolsByCategory();
  const siblings = (grouped[current.category] ?? []).filter(
    (t) => t.slug !== currentSlug
  );

  if (siblings.length === 0) return null;

  const categoryLabel = CATEGORY_LABELS[current.category] ?? current.category;

  return (
    <section className="mt-2">
      {/* Header */}
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="grid size-8 place-items-center rounded-lg"
            style={{
              backgroundColor: "var(--purple-light)",
              color: "var(--purple)",
            }}
          >
            <Sparkles size={16} />
          </span>
          <div>
            <h2
              className="text-[17px] font-bold tracking-[-.02em]"
              style={{ color: "var(--text-primary)" }}
            >
              Related Tools
            </h2>
            <p
              className="text-[12px]"
              style={{ color: "var(--text-muted)" }}
            >
              More {categoryLabel.toLowerCase()} tools
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {siblings.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              className="group flex items-center gap-3 rounded-xl border p-3.5 transition hover:-translate-y-[1px]"
              style={{
                borderColor: "var(--border-card)",
                backgroundColor: "var(--surface-card)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <span
                className="grid size-10 shrink-0 place-items-center rounded-lg"
                style={{
                  backgroundColor: "var(--purple-light)",
                  color: "var(--purple)",
                }}
              >
                <Icon size={18} strokeWidth={2} />
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className="block truncate text-[13.5px] font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t.name}
                </span>
                <span
                  className="block truncate text-[11.5px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t.description}
                </span>
              </span>

              <span
                className="grid size-7 shrink-0 place-items-center rounded-full transition group-hover:brightness-105"
                style={{
                  backgroundColor: "var(--purple-light)",
                  color: "var(--purple)",
                }}
              >
                <ArrowRight size={13} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */
export function CalculatorLayout({
  breadcrumb,
  children,
}: CalculatorLayoutProps) {
  const pathname = usePathname();

  // Extract slug from /tools/[slug]  →  "age-calculator"
  const currentSlug =
    pathname?.startsWith("/tools/")
      ? pathname.slice("/tools/".length).split("/")[0]
      : null;

  return (
    <div className="pb-8"
      // style={{ backgroundColor: "#0f1e1c" }}    
    >
      {/* ============================================================ */}
      {/* TOP AD — navbar width                                        */}
      {/* ============================================================ */}
      <div className="mx-auto max-w-[1600px] px-3 pt-5 sm:px-4">
        <AdSlot type="top" />
      </div>

      {/* ============================================================ */}
{/* LOCAL TIME STRIP — NEW                                       */}
{/* ============================================================ */}
<div className="mx-auto mt-4 max-w-[1400px] px-4 sm:px-5">
  <LocalTimeStrip />
</div>

      {/* ============================================================ */}
      {/* PAGE CONTENT                                                 */}
      {/* ============================================================ */}
      <div className="mx-auto mt-5 max-w-[1400px] px-4 sm:px-5">
        <div className="space-y-5">
          {/* Breadcrumb ---------------------------------------------- */}
          {breadcrumb && breadcrumb.length > 0 && (
            <nav aria-label="Breadcrumb" className="text-[12px]">
              <ol
                className="flex flex-wrap items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                {breadcrumb.map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    {c.href ? (
                      <Link
                        href={c.href}
                        className="transition hover:opacity-80"
                        style={{ color: "var(--accent-primary)" }}
                      >
                        {c.label}
                      </Link>
                    ) : (
                      <span>{c.label}</span>
                    )}
                    {i < breadcrumb.length - 1 && <span>/</span>}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Main content + sidebar ad ------------------------------- */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_336px]">
            <div className="min-w-0 space-y-5">
              {children}

              <AdSlot type="in-content" />

              {/* ↓ NEW — Related tools from the same category */}
              <RelatedTools currentSlug={currentSlug} />

              <AdSlot type="mobile" />
            </div>

            {/* Sidebar ad (desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-4">
                <AdSlot type="sidebar" />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}