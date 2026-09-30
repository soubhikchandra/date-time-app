// // components/layout/calculator-layout.tsx
// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import {
//   ArrowRight,
//   Calendar,
//   CalendarDays,
//   CalendarPlus,
//   Flame,
//   Globe2,
// } from "lucide-react";
// import { AllToolsModal } from "./all-tools-modal";

// interface CalculatorLayoutProps {
//   title: string;
//   description?: string;
//   children: React.ReactNode;
// }

// /* ------------------------------------------------------------------ */
// /*  Shared card chrome                                                 */
// /* ------------------------------------------------------------------ */
// const CARD =
//   "rounded-[18px] border border-white/90 " +
//   "shadow-[0_8px_20px_rgba(64,69,145,0.06),0_2px_5px_rgba(64,69,145,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]";

// /* ------------------------------------------------------------------ */
// /*  Popular tools (bottom strip)                                       */
// /* ------------------------------------------------------------------ */
// const POPULAR = [
//   {
//     slug: "age-calculator",
//     name: "Age Calculator",
//     desc: "Find your exact age",
//     icon: Calendar,
//     accent: "#554CC4",
//     bg: "#E9E7FF",
//   },
//   {
//     slug: "date-difference",
//     name: "Date Difference",
//     desc: "Find days between dates",
//     icon: CalendarDays,
//     accent: "#2E78F0",
//     bg: "#E5F0FF",
//   },
//   {
//     slug: "add-days",
//     name: "Add Days to Date",
//     desc: "Add or subtract days",
//     icon: CalendarPlus,
//     accent: "#F04F96",
//     bg: "#FDE8F2",
//   },
//   {
//     slug: "timezone-converter",
//     name: "Time Zone Converter",
//     desc: "Convert time zones",
//     icon: Globe2,
//     accent: "#F58A20",
//     bg: "#FFF0DF",
//   },
// ];

// /* ------------------------------------------------------------------ */
// /*  Responsive ad slot                                                 */
// /*                                                                     */
// /*  No fixed width. No fixed height. The parent container decides the  */
// /*  size — this component only guarantees:                             */
// /*    · width: 100% of its column                                      */
// /*    · a minimum height so the slot doesn't collapse on empty         */
// /*                                                                     */
// /*  When AdSense (or any ad network) is wired in, replace the inner    */
// /*  placeholder with the ad unit — the outer slot stays the same.      */
// /* ------------------------------------------------------------------ */
// function AdSlot({ label = "Advertisement" }: { label?: string }) {
//   return (
//     <div
//       className="ad-slot w-full max-w-full rounded-2xl"
//       style={{
//         backgroundColor: "#F5F7FC",
//         border: "1px dashed #C8CEE8",
//         color: "#7E83AF",
//         minHeight: 120,
//       }}
//     >
//       <div className="flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-1.5 p-4 text-center">
//         <span className="grid size-10 place-items-center rounded-xl bg-white/80 text-[#7E83AF]">
//           <svg
//             width="20"
//             height="20"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="1.8"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           >
//             <rect x="3" y="3" width="18" height="18" rx="3" />
//             <circle cx="8.5" cy="9" r="1.5" />
//             <path d="m21 15-5-5L5 21" />
//           </svg>
//         </span>
//         <p className="text-[12px] font-semibold uppercase tracking-[.16em]">
//           {label}
//         </p>
//       </div>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Layout                                                             */
// /* ------------------------------------------------------------------ */
// export function CalculatorLayout({ children }: CalculatorLayoutProps) {
//   const [allToolsOpen, setAllToolsOpen] = useState(false);

//   return (
//     <div className="mx-auto max-w-[1440px] px-4 pb-5 pt-5 sm:px-5">
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] xl:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]">
//         {/* ============================================================ */}
//         {/* LEFT: main column                                             */}
//         {/* ============================================================ */}
//         <div className="min-w-0 space-y-4">
//           {/* HERO ----------------------------------------------------- */}
//           <section
//             className={`${CARD} relative overflow-hidden px-6 py-6 sm:px-8 sm:py-7`}
//             style={{
//               background: "linear-gradient(135deg, #F5F3FF 0%, #E9E9FF 100%)",
//               minHeight: "210px",
//             }}
//           >
//             <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_auto]">
//               <div className="relative z-10 min-w-0">
//                 <p className="mb-3 text-[11px] font-bold uppercase tracking-[1.8px] text-[#6047F5]">
//                   Simple • Accurate • Useful
//                 </p>
//                 <h1 className="text-[34px] font-extrabold leading-[1.05] tracking-[-.02em] sm:text-[42px]">
//                   <span className="text-[#0B0D40]">Turn dates into</span>
//                   <br />
//                   <span className="text-[#554CC4]">meaningful answers.</span>
//                 </h1>
//                 <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#7180A8] sm:text-base">
//                   A collection of date and time tools for everyday
//                   calculations, planning and curiosities.
//                 </p>
//               </div>

//               <div className="relative hidden shrink-0 sm:block">
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img
//                   src="/watch.png"
//                   alt=""
//                   aria-hidden="true"
//                   draggable={false}
//                   className="h-auto w-[230px] select-none lg:w-[270px]"
//                 />
//               </div>
//             </div>
//           </section>

//           {/* CALCULATOR (children) ----------------------------------- */}
//           {children}

//           {/* POPULAR TOOLS ------------------------------------------- */}
//           <section>
//             <div className="mb-3 flex items-end justify-between gap-3">
//               <div className="flex items-center gap-2">
//                 <span className="grid size-8 place-items-center rounded-lg bg-[#FFF0DF] text-[#F58A20]">
//                   <Flame size={16} />
//                 </span>
//                 <div>
//                   <h2 className="text-[18px] font-bold tracking-[-.02em] text-[#0B0D40]">
//                     Popular Tools
//                   </h2>
//                   <p className="text-[12px] text-[#7E83AF]">
//                     Most used date and time tools
//                   </p>
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setAllToolsOpen(true)}
//                 className="inline-flex items-center gap-1 text-xs font-bold text-[#554CC4] transition hover:opacity-80"
//               >
//                 View all <ArrowRight size={13} />
//               </button>
//             </div>

//             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
//               {POPULAR.map((p) => {
//                 const Icon = p.icon;
//                 return (
//                   <Link
//                     key={p.slug}
//                     href={`/tools/${p.slug}`}
//                     className={`group flex items-center gap-3 ${CARD} p-3`}
//                     style={{ backgroundColor: "#F5F6FC" }}
//                   >
//                     <span
//                       className="grid size-10 shrink-0 place-items-center rounded-xl"
//                       style={{ backgroundColor: p.bg, color: p.accent }}
//                     >
//                       <Icon size={18} strokeWidth={2} />
//                     </span>
//                     <span className="min-w-0 flex-1">
//                       <span className="block truncate text-[13px] font-bold text-[#0B0D40]">
//                         {p.name}
//                       </span>
//                       <span className="block truncate text-[11px] text-[#7E83AF]">
//                         {p.desc}
//                       </span>
//                     </span>
//                     <span
//                       className="grid size-6 shrink-0 place-items-center rounded-full transition group-hover:brightness-105"
//                       style={{ backgroundColor: p.bg, color: p.accent }}
//                     >
//                       <ArrowRight size={12} />
//                     </span>
//                   </Link>
//                 );
//               })}
//             </div>
//           </section>
//         </div>

//         {/* ============================================================ */}
//         {/* RIGHT: ad column — width controlled by the grid              */}
//         {/* ============================================================ */}
//         <aside className="flex h-full w-full flex-col gap-4">
//           {/* Slot 1 — top of the column */}
//           <div className={`${CARD} w-full p-3`}>
//             <AdSlot label="Advertisement" />
//           </div>

//           {/* Slot 2 — mid column */}
//           <div className={`${CARD} w-full p-3`}>
//             <AdSlot label="Advertisement" />
//           </div>

//           {/* Slot 3 — grows on desktop to fill leftover vertical space.
//               Hidden below lg so it never adds height to the mobile stack. */}
//           <div className={`${CARD} hidden w-full flex-1 p-3 lg:block`}>
//             <div className="flex h-full w-full flex-col">
//               <div className="flex-1">
//                 <AdSlot label="Sponsored" />
//               </div>
//             </div>
//           </div>
//         </aside>
//       </div>

//       {/* All Tools Modal */}
//       <AllToolsModal
//         isOpen={allToolsOpen}
//         onClose={() => setAllToolsOpen(false)}
//       />
//     </div>
//   );
// }


// -----------------------------------------------------------------------------------
// components/layout/calculator-layout.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  CalendarPlus,
  Flame,
  Globe2,
} from "lucide-react";
import { AllToolsModal } from "./all-tools-modal";

interface CalculatorLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const POPULAR = [
  {
    slug: "age-calculator",
    name: "Age Calculator",
    desc: "Find your exact age",
    icon: Calendar,
    accent: "var(--accent-primary)",
    bg: "var(--accent-soft)",
  },
  {
    slug: "date-difference",
    name: "Date Difference",
    desc: "Find days between dates",
    icon: CalendarDays,
    accent: "#2E78F0",
    bg: "var(--row-months-bg)",
  },
  {
    slug: "add-days",
    name: "Add Days to Date",
    desc: "Add or subtract days",
    icon: CalendarPlus,
    accent: "#F04F96",
    bg: "var(--row-weeks-bg)",
  },
  {
    slug: "timezone-converter",
    name: "Time Zone Converter",
    desc: "Convert time zones",
    icon: Globe2,
    accent: "#F58A20",
    bg: "#FFF0DF",
  },
];

function AdSlot({ label = "Advertisement" }: { label?: string }) {
  return (
    <div className="surface-ad ad-slot w-full max-w-full" style={{ minHeight: 120 }}>
      <div className="flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-1.5 p-4 text-center">
        <span
          className="grid size-10 place-items-center rounded-xl"
          style={{
            backgroundColor: "var(--surface-card)",
            color: "var(--text-muted)",
          }}
        >
          <svg
            width="20"
            height="20"
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
          className="text-[12px] font-semibold uppercase tracking-[.16em]"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export function CalculatorLayout({ children }: CalculatorLayoutProps) {
  const [allToolsOpen, setAllToolsOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-5 pt-5 sm:px-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] xl:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]">
        {/* LEFT */}
        <div className="min-w-0 space-y-4">
        
{/* HERO ----------------------------------------------------- */}
<section
  className="hero-card relative overflow-hidden rounded-[20px] px-6 py-6 sm:px-8 sm:py-7"
  style={{ minHeight: "210px" }}
>
  <div className="relative grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_auto]">
    <div className="relative z-10 min-w-0">
      <p className="hero-eyebrow mb-3 text-[11px] font-bold uppercase tracking-[1.8px]">
        Simple • Accurate • Useful
      </p>

      <h1 className="text-[34px] font-extrabold leading-[1.05] tracking-[-.02em] sm:text-[42px]">
        <span className="hero-title-primary">Turn dates into</span>
        <br />
        <span className="hero-title-accent">meaningful answers.</span>
      </h1>

      <p className="hero-desc mt-3 max-w-md text-[15px] leading-relaxed sm:text-base">
        A collection of date and time tools for everyday calculations,
        planning and curiosities.
      </p>
    </div>

    <div className="relative hidden shrink-0 sm:block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/watch.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="hero-illustration h-auto w-[230px] select-none lg:w-[270px]"
      />
    </div>
  </div>
</section>
          {/* CALCULATOR */}
          {children}

          {/* POPULAR TOOLS */}
          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-[#FFF0DF] text-[#F58A20]">
                  <Flame size={16} />
                </span>
                <div>
                  <h2
                    className="text-[18px] font-bold tracking-[-.02em]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Popular Tools
                  </h2>
                  <p
                    className="text-[12px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Most used date and time tools
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllToolsOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold transition hover:opacity-80"
                style={{ color: "var(--accent-primary)" }}
              >
                View all <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {POPULAR.map((p) => {
                const Icon = p.icon;
                return (
                  <Link
                    key={p.slug}
                    href={`/tools/${p.slug}`}
                    className="surface-card-soft group flex items-center gap-3 p-3 transition hover:brightness-105"
                  >
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl"
                      style={{ backgroundColor: p.bg, color: p.accent }}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block truncate text-[13px] font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {p.name}
                      </span>
                      <span
                        className="block truncate text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {p.desc}
                      </span>
                    </span>
                    <span
                      className="grid size-6 shrink-0 place-items-center rounded-full transition group-hover:brightness-105"
                      style={{ backgroundColor: p.bg, color: p.accent }}
                    >
                      <ArrowRight size={12} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT: ad column */}
        <aside className="flex h-full w-full flex-col gap-4">
          <div className="surface-card w-full p-3">
            <AdSlot label="Advertisement" />
          </div>
          <div className="surface-card w-full p-3">
            <AdSlot label="Advertisement" />
          </div>
          <div className="surface-card hidden w-full flex-1 p-3 lg:block">
            <div className="flex h-full w-full flex-col">
              <div className="flex-1">
                <AdSlot label="Sponsored" />
              </div>
            </div>
          </div>
        </aside>
      </div>

      <AllToolsModal
        isOpen={allToolsOpen}
        onClose={() => setAllToolsOpen(false)}
      />
    </div>
  );
}


// ------------------------------------------------------------------------------------------------------------------------------------------------

// When you wire in AdSense
// Replace the inner placeholder <div> in AdSlot with your ad unit:

// tsx
// function AdSlot({ label = "Advertisement" }: { label?: string }) {
//   return (
//     <div
//       className="ad-slot w-full max-w-full"
//       style={{
//         backgroundColor: "#F5F7FC",
//         border: "1px dashed #C8CEE8",
//         borderRadius: 16,
//         minHeight: 120,
//       }}
//     >
//       {/* <ins
//         className="adsbygoogle"
//         style={{ display: "block" }}
//         data-ad-client="ca-pub-XXXXXXXX"
//         data-ad-slot="XXXXXXXX"
//         data-ad-format="auto"
//         data-full-width-responsive="true"
//       /> */}
//       <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-1.5 p-4 text-center">
//         {/* current placeholder content */}
//       </div>
//     </div>
//   );
// }
// The outer container stays exactly as it is — width 100%, no fixed height. The ad network handles the actual sizing and format.
// ------------------------------------------------------------------------------------------------------------------------------------------------