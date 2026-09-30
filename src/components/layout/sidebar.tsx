// components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import { getToolsByCategory } from "@/config/tools";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  dates: "DATE CALCULATIONS",
  time: "TIME",
  timezone: "TIME & PLACE",
  timers: "TIMERS",
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const groups = getToolsByCategory();

  return (
    <aside
      className={cn(
        "sidebar-surface fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col overflow-hidden transition-transform duration-200",
        // Desktop (≥1444px): sticky, always visible
        "min-[1444px]:sticky min-[1444px]:top-0 min-[1444px]:z-auto min-[1444px]:h-screen min-[1444px]:translate-x-0",
        // Below 1444px: slide off unless opened
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* ----------------------------------------------------------- */}
      {/* Brand header                                                */}
      {/* ----------------------------------------------------------- */}
      <div
        className="flex items-center justify-between px-5 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
      >
        {/* <Link href="/" onClick={onClose} className="flex items-center gap-3">
          <span className="relative grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-[#4038A8] shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
            <Clock3 size={20} />
            <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-[#7C6FF6] ring-2 ring-[#4545A8]" />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-sm font-extrabold tracking-[-.02em] text-white">
              Date &amp; Time
            </strong>
            <small className="block font-mono text-[9px] uppercase tracking-[.18em] text-white/70">
              toolkit
            </small>
          </span>
        </Link> */}

<Link href="/" onClick={onClose} className="flex items-center gap-3">
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src="/Home.png"
    alt="Home"
    draggable={false}
    className="size-10 shrink-0 select-none object-contain"
  />
  <span className="min-w-0">
    <strong className="block truncate text-[17px] font-extrabold tracking-[-.02em] text-white">
      Home
    </strong>
  </span>
</Link>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid size-9 place-items-center rounded-xl text-white/80 transition hover:bg-white/12 hover:text-white min-[1444px]:hidden"
        >
          <X size={16} />
        </button>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Nav                                                         */}
      {/* ----------------------------------------------------------- */}
      <nav className="sidebar-scroll flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {Object.entries(groups).map(([category, tools], groupIndex) => (
          <div key={category}>
            <p
              className={cn(
                "mb-2 px-3 font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-white/60",
                groupIndex > 0 && "pt-3"
              )}
              style={
                groupIndex > 0
                  ? { borderTop: "1px solid rgba(255,255,255,0.12)" }
                  : undefined
              }
            >
              {CATEGORY_LABELS[category] ?? category}
            </p>

            <ul className="grid gap-0.5">
              {tools.map((tool) => {
                const href = `/tools/${tool.slug}`;
                const active = pathname === href;
                const Icon = tool.icon;
                return (
                  <li key={tool.slug}>
                    <Link
                      href={href}
                      onClick={onClose}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                        active
                          ? "bg-[#F3F2FF] text-[#4038A8] shadow-[0_6px_18px_rgba(0,0,0,0.12)]"
                          : "text-white hover:bg-white/12"
                      )}
                    >
                      <Icon
                        size={17}
                        strokeWidth={active ? 2.2 : 1.9}
                        className={cn(
                          "shrink-0",
                          active ? "text-[#4038A8]" : "text-white"
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-bold">
                        {tool.name}
                      </span>
                      {active && (
                        <ChevronRight
                          size={14}
                          className="shrink-0 text-[#4038A8]"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

{/* ----------------------------------------------------------- */}
{/* Footer — brand block                                        */}
{/* ----------------------------------------------------------- */}
<div
  className="mt-2 px-4 pt-4 pb-5"
  style={{
    background: "rgba(0,0,0,0.08)",
    borderTop: "1px solid rgba(255,255,255,0.12)",
  }}
>
  <div className="flex items-center gap-3">
    <span
      className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-2xl"
      style={{
        backgroundColor: "#F4F3FF",
        boxShadow:
          "0 4px 14px rgba(106,85,255,0.35), inset 0 1px 0 rgba(255,255,255,0.95)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand-logo.png"
        alt="Date & Time logo"
        draggable={false}
        className="size-full select-none object-contain p-[3px]"
      />
    </span>
    <div className="min-w-0">
      <p className="truncate text-sm font-extrabold tracking-[-.02em] text-white">
        Date &amp; Time
      </p>
      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[.18em] text-white/70">
        Toolkit
      </p>
    </div>
  </div>
</div>
    </aside>
  );
}