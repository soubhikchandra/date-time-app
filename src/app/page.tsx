// app/page.tsx
"use client";

import { AdSlot } from "@/components/ads/ad-slot";
import { WorldTimeHero } from "@/components/Home/world-time-hero";
import { ToolCategories } from "@/components/Home/tool-categories";

export default function HomePage() {
  return (
    <div className="pb-10">
      {/* Top ad — matches navbar container */}
      <div className="mx-auto max-w-[1600px] px-3 pt-5 sm:px-4">
        <AdSlot type="top" />
      </div>

      {/* Content */}
      <div className="mx-auto mt-5 max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_336px]">
          <div className="min-w-0 space-y-7">
            <WorldTimeHero />

            {/*  Thin light green separator */}
            {/* <div
              className="w-full"
              style={{
                height: "1px",
                background:
                  "linear-gradient(to right, transparent, #C9E6DD 15%, #C9E6DD 85%, transparent)",
              }}
              aria-hidden="true"
            /> */}

            <div
  className="w-full"
  style={{
    height: "1px",
    backgroundColor: "#C9E6DD",
  }}
  aria-hidden="true"
/>

            <ToolCategories />
          </div>

          {/* Sidebar ad */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <AdSlot type="sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}