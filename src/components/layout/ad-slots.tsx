// src/components/layout/ad-slots.tsx
"use client";

import { cn } from "@/lib/utils";

function AdPlaceholder({ label = "Advertisement" }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-center">
      <span
        className="grid size-9 place-items-center rounded-lg"
        style={{ backgroundColor: "var(--surface-card)", color: "var(--text-muted)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="9" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </span>
      <p className="text-[11px] font-semibold uppercase tracking-[.16em]"
        style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

function AdSlot({
  label,
  minHeight,
  aspect,
  className,
  children,
}: {
  label?: string;
  minHeight?: number;
  aspect?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn("surface-ad w-full overflow-hidden", className)}
      style={{ minHeight, aspectRatio: aspect }}
    >
      {children ?? <AdPlaceholder label={label} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TOP — full-bleed, same width as the navbar                        */
/* ------------------------------------------------------------------ */
export function TopAdSlot() {
  return (
    <div className="w-full px-3 sm:px-4">
      <div className="mx-auto max-w-[1600px]">
        <AdSlot
          label="Advertisement"
          className="[min-height:60px] sm:[min-height:90px]"
        />
      </div>
    </div>
  );
}

export function DesktopSidebarAdSlot() {
  return (
    <AdSlot
      label="Advertisement"
      className="[min-height:250px] lg:[min-height:600px]"
    />
  );
}

export function InContentAdSlot() {
  return (
    <AdSlot
      label="Advertisement"
      className="[min-height:100px] sm:[min-height:250px]"
    />
  );
}

export function MobileAdSlot() {
  return (
    <AdSlot
      label="Advertisement"
      className="[min-height:100px] lg:hidden"
    />
  );
}