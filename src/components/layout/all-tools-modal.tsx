// components/layout/all-tools-modal.tsx
"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { getToolsByCategory } from "@/config/tools";

/* ------------------------------------------------------------------ */
/*  Category meta — matches sidebar labels + accent colors            */
/* ------------------------------------------------------------------ */
const CATEGORY_META: Record<
  string,
  { label: string; accent: string; bg: string }
> = {
  dates: { label: "Dates", accent: "#554CC4", bg: "#E9E7FF" },
  time: { label: "Time", accent: "#2E78F0", bg: "#E5F0FF" },
  timezone: { label: "Time & Place", accent: "#F04F96", bg: "#FDE8F2" },
  timers: { label: "Timers", accent: "#F58A20", bg: "#FFF0DF" },
};

/* ------------------------------------------------------------------ */
/*  SSR-safe mount check                                              */
/* ------------------------------------------------------------------ */
const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface AllToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AllToolsModal({ isOpen, onClose }: AllToolsModalProps) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot
  );

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  /* Lock scroll while open */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const groups = getToolsByCategory();
  const totalTools = Object.values(groups).reduce(
    (sum, list) => sum + list.length,
    0
  );

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0B0D40]/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Card */}
      <div
        role="dialog"
        aria-label="All tools"
        className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[20px] border border-white/90 shadow-[0_20px_60px_rgba(70,65,150,0.25)]"
        style={{ backgroundColor: "#FAFAFD" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-3 px-6 py-5"
          style={{ borderBottom: "1px solid #E6E7F7" }}
        >
          <div className="min-w-0">
            <p
              className="uppercase"
              style={{
                color: "#554CC4",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "1.6px",
              }}
            >
              All Tools
            </p>
            <h2
              className="mt-1 text-xl font-extrabold tracking-[-.02em]"
              style={{ color: "#0B0D40" }}
            >
              Every calculator in one place
            </h2>
            <p className="mt-0.5 text-[12.5px]" style={{ color: "#7E83AF" }}>
              {totalTools} tools · Organized by category
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 shrink-0 place-items-center rounded-full text-[#7E83AF] transition hover:bg-[#F0EEFF] hover:text-[#554CC4]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {Object.entries(groups).map(([category, tools]) => {
              const meta =
                CATEGORY_META[category] ?? {
                  label: category,
                  accent: "#554CC4",
                  bg: "#E9E7FF",
                };

              return (
                <div key={category}>
                  {/* Category label */}
                  <p
                    className="mb-2.5 uppercase"
                    style={{
                      color: "#7E83AF",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      letterSpacing: "1.4px",
                    }}
                  >
                    {meta.label}
                  </p>

                  {/* Tools grid */}
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {tools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          onClick={onClose}
                          className="group flex items-center gap-3 rounded-2xl p-3 transition hover:-translate-y-0.5"
                          style={{
                            backgroundColor: "#F5F6FC",
                            border: "1px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#DCE0F0";
                            e.currentTarget.style.backgroundColor = "#FAFAFD";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "transparent";
                            e.currentTarget.style.backgroundColor = "#F5F6FC";
                          }}
                        >
                          <span
                            className="grid size-11 shrink-0 place-items-center rounded-xl"
                            style={{
                              backgroundColor: meta.bg,
                              color: meta.accent,
                            }}
                          >
                            <Icon size={20} strokeWidth={1.9} />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className="block truncate text-[13.5px] font-bold"
                              style={{ color: "#0B0D40" }}
                            >
                              {tool.name}
                            </span>
                            <span
                              className="mt-0.5 block truncate text-[11.5px]"
                              style={{ color: "#7E83AF" }}
                            >
                              {tool.description}
                            </span>
                          </span>

                          <span
                            className="grid size-7 shrink-0 place-items-center rounded-full transition group-hover:brightness-105"
                            style={{
                              backgroundColor: meta.bg,
                              color: meta.accent,
                            }}
                          >
                            <ArrowRight size={13} />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}