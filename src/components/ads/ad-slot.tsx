// src/components/ads/ad-slot.tsx
"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  ADSENSE_ENABLED,
  getAdClient,
  getAdSlot,
  loadAdSenseScript,
  type AdType,
} from "@/lib/adsense";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Layout reservation per type — controls min-height / max-width      */
/*  so the surrounding page never shifts when the ad loads.            */
/* ------------------------------------------------------------------ */
const LAYOUT: Record<
  AdType,
  { wrapper: string; minHeight: number | string; maxWidth?: string }
> = {
  top: {
    wrapper: " w-full", //mx-auto
    minHeight: 90,
    // maxWidth: "970px",  //centered ad , general ad for the google mostly
  },
  sidebar: {
    wrapper: "w-full",
    minHeight: 600,
    maxWidth: "336px",
  },
  "in-content": {
    wrapper: "w-full",
    minHeight: 250,
    // maxWidth: "728px",
  },
  mobile: {
    wrapper: "w-full lg:hidden",
    minHeight: 100,
    maxWidth: "360px",
  },
};

/* ------------------------------------------------------------------ */
/*  SSR-safe mount check                                               */
/* ------------------------------------------------------------------ */
const subscribeNoop = () => () => {};
const getMountedClient = () => true;
const getMountedServer = () => false;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function AdSlot({
  type = "in-content",
  className,
  label = "Advertisement",
}: {
  type?: AdType;
  className?: string;
  label?: string;
}) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getMountedClient,
    getMountedServer
  );
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const layout = LAYOUT[type];
  const client = getAdClient();
  const slot = getAdSlot(type);

  /* ---- Load script + push the ad unit once, on mount ---- */
  useEffect(() => {
    if (!mounted || !ADSENSE_ENABLED || !slot) return;
    if (pushed.current) return;

    let cancelled = false;

    loadAdSenseScript()
      .then(() => {
        if (cancelled || !insRef.current) return;
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushed.current = true;
        } catch (err) {
          // Duplicate push or script not ready — ignore silently
          console.warn("[AdSlot] adsbygoogle.push failed", err);
        }
      })
      .catch(() => {
        /* script failed to load; placeholder stays visible */
      });

    return () => {
      cancelled = true;
    };
  }, [mounted, slot]);

  /* ---- Determine whether to render a real ad or the placeholder ---- */
  const canRenderRealAd = ADSENSE_ENABLED && Boolean(slot);

  return (
    <div
      className={cn(layout.wrapper, className)}
      style={{ maxWidth: layout.maxWidth }}
      role="complementary"
      aria-label={label}
    >
      <div
        className="flex w-full items-center justify-center overflow-hidden rounded-xl"
        style={{
          backgroundColor: "var(--surface-ad, transparent)",
          border: "1px dashed var(--border-ad, rgba(0,0,0,0.1))",
          minHeight: layout.minHeight,
        }}
      >
        {canRenderRealAd ? (
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <Placeholder label={label} minHeight={layout.minHeight} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dev placeholder — shown when AdSense is not configured             */
/* ------------------------------------------------------------------ */
function Placeholder({
  label,
  minHeight,
}: {
  label: string;
  minHeight: number | string;
}) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-4 text-center"
      style={{ minHeight }}
    >
      <span
        className="grid size-9 place-items-center rounded-lg"
        style={{
          backgroundColor: "var(--surface-card)",
          color: "var(--text-muted)",
        }}
      >
        <svg
          width="18"
          height="18"
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
        className="text-[11px] font-semibold uppercase tracking-[.16em]"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
    </div>
  );
}