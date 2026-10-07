// src/components/Home/tool-categories.tsx
"use client";

import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Globe2,
  Timer,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";
import { getToolsByCategory, TOOLS } from "@/config/tools";

const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    color: string;
    softBg: string;
  }
> = {
  dates: {
    label: "Dates",
    icon: CalendarIcon,
    color: "#2563EB",
    softBg: "#EAF4FF",
  },
  timezone: {
    label: "Time Zones",
    icon: Globe2,
    color: "#008F72",
    softBg: "#E8F6F1",
  },
  timers: {
    label: "Timers",
    icon: Timer,
    color: "#7C3AED",
    softBg: "#F2EDFF",
  },
};

export function ToolCategories() {
  const raw = getToolsByCategory();

  const grouped: Record<string, (typeof TOOLS)[number][]> = {
    dates: raw.dates as (typeof TOOLS)[number][],
    timezone: raw.timezone as (typeof TOOLS)[number][],
    timers: [
      ...((raw.timers ?? []) as (typeof TOOLS)[number][]),
      ...((raw.time ?? []) as (typeof TOOLS)[number][]),
    ],
  };

  const order = ["dates", "timezone", "timers"];

  return (
    <section>
      {/* Bigger header */}
      <div className="mb-2">
        <h2
          className="flex items-center gap-2.5 text-[22px] font-extrabold tracking-[-.02em] sm:text-[26px]"
          style={{ color: "var(--text-primary)" }}
        >
          <LayoutGrid size={20} style={{ color: "var(--purple)" }} />
          All Date &amp; Time Tools
        </h2>
      </div>
      <p
        className="mb-5 text-[14px] sm:text-[15px]"
        style={{ color: "var(--text-muted)" }}
      >
        Calculate, convert, and solve everyday date and time problems.
      </p>

      {/* 3 cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {order.map((cat) => {
          const meta = CATEGORY_CONFIG[cat];
          const Icon = meta.icon;
          const tools = grouped[cat] ?? [];

          return (
            <div
              key={cat}
              className="flex flex-col overflow-hidden rounded-xl border bg-white"
              style={{
                borderColor: "var(--border-card)",
                boxShadow: "0 2px 8px rgba(16,44,41,0.04)",
              }}
            >
              {/* Colored header */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ backgroundColor: meta.softBg }}
              >
                <span
                  className="grid size-7 place-items-center rounded-lg text-white"
                  style={{ backgroundColor: meta.color }}
                >
                  <Icon size={14} strokeWidth={2.2} />
                </span>
                <h3
                  className="text-[15px] font-extrabold tracking-[-.01em]"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </h3>
              </div>

              {/* Tools list — fixed height ~4 rows, scrolls for the rest */}
              <ul
                className="tool-category-scroll"
                style={{ height: "296px" }}
              >
                {tools.map((t) => {
                  const ToolIcon = t.icon;
                  return (
                    <li key={t.slug}>
                      <Link
                        href={`/tools/${t.slug}`}
                        className="group flex items-center gap-3 border-b px-4 py-3 transition hover:bg-[var(--surface-card-soft)]"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <span
                          className="grid size-8 shrink-0 place-items-center rounded-lg"
                          style={{
                            backgroundColor: meta.softBg,
                            color: meta.color,
                          }}
                        >
                          <ToolIcon size={15} strokeWidth={2.2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-[13px] font-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {t.name}
                          </p>
                          <p
                            className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {t.description}
                          </p>
                        </div>
                        <ArrowRight
                          size={14}
                          className="shrink-0 transition group-hover:translate-x-0.5"
                          style={{ color: "var(--text-muted)" }}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}