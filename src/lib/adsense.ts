// src/lib/adsense.ts
"use client";

/* ------------------------------------------------------------------ */
/*  CONFIG — the ONLY place AdSense details live.                      */
/*  Set these in .env.local:                                           */
/*    NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX               */
/*    NEXT_PUBLIC_ADSENSE_SLOT_TOP=1234567890                          */
/*    NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=1234567891                      */
/*    NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT=1234567892                   */
/*    NEXT_PUBLIC_ADSENSE_SLOT_MOBILE=1234567893                       */
/* ------------------------------------------------------------------ */

export type AdType = "top" | "sidebar" | "in-content" | "mobile";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

const SLOTS: Record<AdType, string> = {
  top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP ?? "",
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? "",
  "in-content": process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT ?? "",
  mobile: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MOBILE ?? "",
};

export const ADSENSE_ENABLED = Boolean(CLIENT);

export function getAdClient(): string {
  return CLIENT;
}

export function getAdSlot(type: AdType): string {
  return SLOTS[type];
}

/* ------------------------------------------------------------------ */
/*  Script loader — loads AdSense once per page                        */
/* ------------------------------------------------------------------ */

let loadPromise: Promise<void> | null = null;

export function loadAdSenseScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!ADSENSE_ENABLED) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    // Already loaded?
    if (
      document.querySelector(
        `script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]`
      )
    ) {
      resolve();
      return;
    }

    const s = document.createElement("script");
    s.async = true;
    s.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
      encodeURIComponent(CLIENT);
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("AdSense script failed to load"));
    document.head.appendChild(s);
  });

  return loadPromise;
}

/* ------------------------------------------------------------------ */
/*  Type augmentation for window.adsbygoogle                           */
/* ------------------------------------------------------------------ */
declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}