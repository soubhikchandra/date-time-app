// src/components/layout/mobile-sidebar.tsx
"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Clock, X } from "lucide-react";
import { getToolsByCategory } from "@/config/tools";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  dates: "Date Calculations",
  time: "Time",
  timezone: "Time & Place",
  timers: "Timers",
};

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/* SSR-safe mount flag */
const subscribeNoop = () => () => {};
const getMountedClient = () => true;
const getMountedServer = () => false;

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getMountedClient,
    getMountedServer
  );
  const groups = getToolsByCategory();

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  /* Lock body scroll while open */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!mounted) return null;

  const drawer = (
    <div
      className={cn(
        "fixed inset-0 z-[100] lg:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        aria-hidden="true"
      />

      {/* Drawer panel — slides in from the left, dark green */}
      <aside
        role="dialog"
        aria-label="All tools"
        className={cn(
          "absolute inset-y-0 left-0 flex w-[88vw] max-w-[340px] flex-col transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          backgroundColor: "var(--navbar-bg)",
          borderRight: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-3 px-4 py-4"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}
        >
          <Link
            href="/"
            onClick={onClose}
            className="flex min-w-0 items-center gap-2.5"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white">
              <Clock
                size={16}
                strokeWidth={2.4}
                style={{ color: "var(--purple)" }}
              />
            </span>
            <span
              className="truncate text-[15px] font-extrabold tracking-[-.01em]"
              style={{ color: "var(--navbar-fg-hover)" }}
            >
              Date &amp; Time
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-9 shrink-0 place-items-center rounded-full text-white/90 transition hover:bg-white/12 hover:text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tool list — scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-5">
            {Object.entries(groups).map(([category, tools], groupIndex) => (
              <div key={category}>
                <p
                  className={cn(
                    "mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em]",
                    groupIndex > 0 && "pt-3"
                  )}
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    ...(groupIndex > 0
                      ? { borderTop: "1px solid rgba(255, 255, 255, 0.12)" }
                      : {}),
                  }}
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
                            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                            active ? "" : "hover:bg-white/10"
                          )}
                          style={
                            active
                              ? { backgroundColor: "rgba(255, 255, 255, 0.18)" }
                              : undefined
                          }
                        >
                          <Icon
                            size={17}
                            strokeWidth={active ? 2.2 : 1.9}
                            style={{
                              color: active
                                ? "#ffffff"
                                : "rgba(255, 255, 255, 0.85)",
                            }}
                            className="shrink-0"
                          />
                          <span
                            className="min-w-0 flex-1 truncate text-[13px] font-bold"
                            style={{
                              color: active
                                ? "#ffffff"
                                : "rgba(255, 255, 255, 0.9)",
                            }}
                          >
                            {tool.name}
                          </span>
                          {active && (
                            <ChevronRight
                              size={14}
                              className="shrink-0 text-white"
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </div>
  );

  return createPortal(drawer, document.body);
}