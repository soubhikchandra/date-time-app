// // src/components/layout/navbar.tsx
// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { ChevronDown, Clock, History, Menu, Search, X } from "lucide-react";
// import { AccountMenu } from "./account-menu";
// import { useHistory } from "@/components/history/history-context";
// import { getToolsByCategory, TOOLS } from "@/config/tools";
// import { cn } from "@/lib/utils";

// interface NavbarProps {
//   user: { email: string; name?: string } | null;
//   onAuthSuccess: (u: { email: string; name?: string }) => void;
//   onLogout: () => void;
//   onOpenAllTools: () => void;
// }

// const CATEGORY_META: Record<
//   string,
//   { label: string; promoTitle: string; promoBody: string }
// > = {
//   dates: {
//     label: "Date Calculations",
//     promoTitle: "Every date, one click away",
//     promoBody: "Add, subtract, count, and compare dates instantly.",
//   },
//   time: {
//     label: "Time",
//     promoTitle: "Time, measured simply",
//     promoBody: "Timers, stopwatches, and duration tools for any task.",
//   },
//   timezone: {
//     label: "Time & Place",
//     promoTitle: "Time connects our world",
//     promoBody: "Explore, compare, and plan time across different places.",
//   },
//   timers: {
//     label: "Timers",
//     promoTitle: "Never miss a moment",
//     promoBody: "Count down, up, and track time your way.",
//   },
// };

// /* ------------------------------------------------------------------ */
// /*  Category trigger (button only — panel lives separately)           */
// /* ------------------------------------------------------------------ */
// function NavTrigger({
//   category,
//   active,
//   open,
//   onEnter,
//   onLeave,
// }: {
//   category: string;
//   active: boolean;
//   open: boolean;
//   onEnter: () => void;
//   onLeave: () => void;
// }) {
//   const meta = CATEGORY_META[category] ?? { label: category };

//   return (
//     <button
//       type="button"
//       aria-haspopup="true"
//       aria-expanded={open}
//       onMouseEnter={onEnter}
//       onMouseLeave={onLeave}
//       onFocus={onEnter}
//       className={cn(
//         "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-white/90 transition",
//         "hover:bg-white/10 hover:text-white",
//         (open || active) && "bg-white/12 text-white",
//       )}
//     >
//       {meta.label}
//       <ChevronDown
//         size={13}
//         className={cn(
//           "transition-transform duration-150",
//           open && "rotate-180",
//         )}
//       />
//     </button>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Shared dropdown panel — anchored to the nav's left edge           */
// /* ------------------------------------------------------------------ */
// function NavPanel({
//   category,
//   tools,
//   onEnter,
//   onLeave,
// }: {
//   category: string;
//   tools: {
//     slug: string;
//     name: string;
//     description: string;
//     icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
//   }[];
//   onEnter: () => void;
//   onLeave: () => void;
// }) {
//   const meta = CATEGORY_META[category] ?? {
//     label: category,
//     promoTitle: "Explore tools",
//     promoBody: "Find the right tool for the job.",
//   };

//   return (
//     <div
//       className="absolute left-0 top-full z-50 pt-2"
//       style={{ width: "min(720px, calc(100vw - 32px))" }}
//       onMouseEnter={onEnter}
//       onMouseLeave={onLeave}
//     >
//       <div
//         className="overflow-hidden rounded-2xl border bg-white shadow-2xl"
//         style={{ borderColor: "var(--border-card)" }}
//       >
//         <div className="grid grid-cols-1 md:grid-cols-[1fr_240px]">
//           {/* LEFT — tools */}
//           <div className="p-5">
//             <p
//               className="mb-3 text-[10px] font-bold uppercase tracking-[.18em]"
//               style={{ color: "var(--purple)" }}
//             >
//               {meta.label} tools
//             </p>
//             <ul className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
//               {tools.map((tool) => {
//                 const Icon = tool.icon;
//                 return (
//                   <li key={tool.slug}>
//                     <Link
//                       href={`/tools/${tool.slug}`}
//                       className="group flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-[var(--purple-light)]"
//                     >
//                       <span
//                         className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg transition"
//                         style={{
//                           backgroundColor: "var(--purple-light)",
//                           color: "var(--purple)",
//                         }}
//                       >
//                         <Icon size={16} strokeWidth={2} />
//                       </span>
//                       <span className="min-w-0 flex-1">
//                         <span
//                           className="block truncate text-[13px] font-bold"
//                           style={{ color: "var(--text-primary)" }}
//                         >
//                           {tool.name}
//                         </span>
//                         <span
//                           className="mt-0.5 block truncate text-[11px]"
//                           style={{ color: "var(--text-muted)" }}
//                         >
//                           {tool.description}
//                         </span>
//                       </span>
//                     </Link>
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>

//           {/* RIGHT — promo panel */}
//           <div
//             className="relative hidden flex-col justify-center gap-3 p-6 md:flex"
//             style={{
//               background: "linear-gradient(160deg, #dff0eb 0%, #c9e6dd 100%)",
//             }}
//           >
//             <div className="relative mx-auto mb-1 grid size-20 place-items-center">
//               <div
//                 className="absolute inset-0 rounded-full opacity-70"
//                 style={{ backgroundColor: "#a8d5c8" }}
//               />
//               <div className="relative grid size-12 place-items-center rounded-full bg-white shadow-sm">
//                 <Clock size={22} style={{ color: "var(--purple)" }} />
//               </div>
//               <span className="absolute -left-1 top-2 size-3 rounded-full bg-white/80" />
//               <span className="absolute -right-2 bottom-2 size-2.5 rounded-full bg-white/80" />
//             </div>
//             <p
//               className="text-center text-[14px] font-extrabold leading-snug tracking-[-.01em]"
//               style={{ color: "#0e4a42" }}
//             >
//               {meta.promoTitle}
//             </p>
//             <p
//               className="text-center text-[11.5px] leading-relaxed"
//               style={{ color: "#2c6157" }}
//             >
//               {meta.promoBody}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Round icon control (dark navbar variant)                          */
// /* ------------------------------------------------------------------ */
// function NavIcon({
//   children,
//   label,
//   onClick,
//   badge,
// }: {
//   children: React.ReactNode;
//   label: string;
//   onClick?: () => void;
//   badge?: number;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       aria-label={label}
//       className="relative grid size-9 shrink-0 place-items-center rounded-full text-white/90 transition hover:bg-white/12 hover:text-white"
//     >
//       {children}
//       {badge !== undefined && badge > 0 && (
//         <span
//           className="absolute -right-0.5 -top-0.5 grid min-w-[16px] place-items-center rounded-full px-1 font-mono text-[9px] font-bold text-white"
//           style={{ backgroundColor: "#14a08a" }}
//         >
//           {badge > 9 ? "9+" : badge}
//         </span>
//       )}
//     </button>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  WORKING SEARCH — filters tools, shows dropdown, navigates         */
// /* ------------------------------------------------------------------ */
// function InlineSearch() {
//   const router = useRouter();
//   const [query, setQuery] = useState("");
//   const [open, setOpen] = useState(false);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const results = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return [];
//     return TOOLS.filter((tool) => {
//       const haystack =
//         `${tool.name} ${tool.description} ${tool.category}`.toLowerCase();
//       return haystack.includes(q);
//     }).slice(0, 8);
//   }, [query]);

//   useEffect(() => {
//     const onDown = (e: MouseEvent) => {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(e.target as Node)
//       ) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", onDown);
//     return () => document.removeEventListener("mousedown", onDown);
//   }, []);

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
//         e.preventDefault();
//         inputRef.current?.focus();
//         inputRef.current?.select();
//       }
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   const handleChange = (value: string) => {
//     setQuery(value);
//     setActiveIndex(0);
//     setOpen(true);
//   };

//   const go = (slug: string) => {
//     setQuery("");
//     setOpen(false);
//     setActiveIndex(0);
//     inputRef.current?.blur();
//     router.push(`/tools/${slug}`);
//   };

//   const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Escape") {
//       if (open) {
//         e.preventDefault();
//         setOpen(false);
//       } else {
//         inputRef.current?.blur();
//       }
//       return;
//     }

//     if (!query.trim() || results.length === 0) {
//       if (e.key === "Enter") inputRef.current?.blur();
//       return;
//     }

//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setOpen(true);
//       setActiveIndex((i) => (i + 1) % results.length);
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setOpen(true);
//       setActiveIndex((i) => (i - 1 + results.length) % results.length);
//     } else if (e.key === "Enter") {
//       e.preventDefault();
//       go(results[activeIndex].slug);
//     }
//   };

//   const showDropdown = open && query.trim().length > 0;
//   const activeSlug = results[activeIndex]?.slug;

//   return (
//     <div ref={containerRef} className="relative w-full">
//       <Search
//         size={15}
//         className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//       />
//       <input
//         ref={inputRef}
//         type="text"
//         role="combobox"
//         value={query}
//         onChange={(e) => handleChange(e.target.value)}
//         onFocus={() => query.trim() && setOpen(true)}
//         onKeyDown={onKeyDown}
//         placeholder="Search tools, cities, time zones..."
//         aria-label="Search"
//         aria-autocomplete="list"
//         aria-expanded={showDropdown}
//         aria-controls="navbar-search-results"
//         aria-activedescendant={
//           showDropdown && activeSlug
//             ? `navbar-search-option-${activeSlug}`
//             : undefined
//         }
//         autoComplete="off"
//         className="h-10 w-full rounded-full border border-white/10 bg-white pl-10 pr-20 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-white/40 focus:ring-2 focus:ring-white/15"
//       />

//       {query ? (
//         <button
//           type="button"
//           onClick={() => {
//             setQuery("");
//             setOpen(false);
//             inputRef.current?.focus();
//           }}
//           aria-label="Clear search"
//           className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
//         >
//           <X size={13} />
//         </button>
//       ) : (
//         <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 sm:block">
//           Ctrl K
//         </span>
//       )}

//       {showDropdown && (
//         <div className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
//           {results.length === 0 ? (
//             <div className="p-4 text-[13px] text-slate-500">
//               No tools match{" "}
//               <strong className="text-slate-800">&ldquo;{query}&rdquo;</strong>.
//             </div>
//           ) : (
//             <ul
//               id="navbar-search-results"
//               role="listbox"
//               className="max-h-80 overflow-y-auto p-1.5"
//             >
//               {results.map((tool, i) => {
//                 const Icon = tool.icon;
//                 const active = i === activeIndex;
//                 return (
//                   <li
//                     key={tool.slug}
//                     id={`navbar-search-option-${tool.slug}`}
//                     role="option"
//                     aria-selected={active}
//                   >
//                     <button
//                       type="button"
//                       onMouseEnter={() => setActiveIndex(i)}
//                       onClick={() => go(tool.slug)}
//                       className={cn(
//                         "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition",
//                         active
//                           ? "bg-[var(--purple-light)]"
//                           : "hover:bg-[var(--purple-light)]",
//                       )}
//                     >
//                       <span
//                         className="grid size-8 shrink-0 place-items-center rounded-lg transition"
//                         style={
//                           active
//                             ? {
//                                 backgroundColor: "var(--purple)",
//                                 color: "#FFFFFF",
//                               }
//                             : {
//                                 backgroundColor: "var(--purple-light)",
//                                 color: "var(--purple)",
//                               }
//                         }
//                       >
//                         <Icon size={15} strokeWidth={1.9} />
//                       </span>
//                       <span className="min-w-0 flex-1">
//                         <span
//                           className="block truncate text-[13px] font-bold"
//                           style={{ color: "var(--text-primary)" }}
//                         >
//                           {tool.name}
//                         </span>
//                         <span
//                           className="block truncate text-[11px]"
//                           style={{ color: "var(--text-muted)" }}
//                         >
//                           {tool.description}
//                         </span>
//                       </span>
//                     </button>
//                   </li>
//                 );
//               })}
//             </ul>
//           )}

//           {results.length > 0 && (
//             <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 font-mono text-[10px] uppercase tracking-[.18em] text-slate-400">
//               <span>↑ ↓ navigate</span>
//               <span>↵ open</span>
//               <span>esc close</span>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Main navbar                                                       */
// /* ------------------------------------------------------------------ */
// export function Navbar({
//   user,
//   onAuthSuccess,
//   onLogout,
//   onOpenAllTools,
// }: NavbarProps) {
//   const pathname = usePathname();
//   const { open, entries } = useHistory();

//   const [openState, setOpenState] = useState<{
//     cat: string;
//     path: string;
//   } | null>(null);
//   const openCategory =
//     openState && openState.path === pathname ? openState.cat : null;

//   const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
//   const closeTimer = useRef<number | null>(null);

//   const groups = getToolsByCategory();
//   const categories = Object.keys(groups);

//   const handleEnter = (cat: string) => {
//     if (closeTimer.current) window.clearTimeout(closeTimer.current);
//     setOpenState({ cat, path: pathname });
//   };
//   const handleLeave = () => {
//     if (closeTimer.current) window.clearTimeout(closeTimer.current);
//     closeTimer.current = window.setTimeout(() => setOpenState(null), 120);
//   };

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setOpenState(null);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   return (
//     <div
//       className="sticky top-0 z-40 w-full"
//       style={{ backgroundColor: "var(--navbar-bg)" }}
//     >
//       <div className="relative mx-auto max-w-[1600px] px-3 sm:px-4">
//         <header
//           className="flex items-center gap-3"
//           style={{ height: "var(--navbar-h)" }}
//         >
//           {/* ---------- Mobile hamburger ---------- */}
//           <button
//             type="button"
//             onClick={onOpenAllTools}
//             aria-label="Open menu"
//             className="grid size-9 shrink-0 place-items-center rounded-full text-white/90 transition hover:bg-white/12 hover:text-white lg:hidden"
//           >
//             <Menu size={18} />
//           </button>

//           {/* ---------- Brand ---------- */}
//           <Link href="/" className="flex shrink-0 items-center gap-2.5">
//             <span className="grid size-9 place-items-center rounded-full bg-white">
//               <Clock
//                 size={18}
//                 style={{ color: "var(--purple)" }}
//                 strokeWidth={2.4}
//               />
//             </span>
//             <span className="text-[15px] font-extrabold leading-tight tracking-[-.01em] text-white sm:text-[16px]">
//               Date &amp; Time
//             </span>
//           </Link>

//           {/* ---------- Desktop nav with dropdowns ---------- */}
//           <nav
//             className="relative ml-3 hidden min-w-0 items-center gap-0.5 lg:flex"
//             onMouseLeave={handleLeave}
//           >
//             {categories.map((cat) => {
//               const active = (groups[cat] as { slug: string }[]).some(
//                 (t) => pathname === `/tools/${t.slug}`,
//               );
//               return (
//                 <NavTrigger
//                   key={cat}
//                   category={cat}
//                   active={active}
//                   open={openCategory === cat}
//                   onEnter={() => handleEnter(cat)}
//                   onLeave={handleLeave}
//                 />
//               );
//             })}

//             {openCategory && (
//               <NavPanel
//                 category={openCategory}
//                 tools={groups[openCategory] as never}
//                 onEnter={() => handleEnter(openCategory)}
//                 onLeave={handleLeave}
//               />
//             )}
//           </nav>

//           {/* ---------- Desktop inline search ---------- */}
//           <div className="ml-auto hidden min-w-0 max-w-[440px] flex-1 lg:block">
//             <InlineSearch />
//           </div>

//           {/* ---------- Mobile search icon toggle ---------- */}
//           <button
//             type="button"
//             onClick={() => setMobileSearchOpen((v) => !v)}
//             aria-label="Search"
//             className="ml-auto grid size-9 shrink-0 place-items-center rounded-full text-white/90 transition hover:bg-white/12 hover:text-white lg:hidden"
//           >
//             {mobileSearchOpen ? <X size={16} /> : <Search size={16} />}
//           </button>

//           {/* ---------- Right controls ---------- */}
//           <div className="ml-1 flex shrink-0 items-center gap-1.5">
//             {/* History — desktop only */}
//             <div className="hidden lg:block">
//               <NavIcon label="History" onClick={open} badge={entries.length}>
//                 <History size={16} />
//               </NavIcon>
//             </div>

//             {/* Account menu */}
//             <AccountMenu
//               user={user}
//               onAuthSuccess={onAuthSuccess}
//               onLogout={onLogout}
//             />
//           </div>
//         </header>
//       </div>

//       {/* ---------- Mobile search overlay ---------- */}
//       {mobileSearchOpen && (
//         <div className="relative px-3 pb-3 lg:hidden">
//           <div className="mx-auto max-w-[1600px]">
//             <InlineSearch />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// src/components/layout/navbar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Clock,
  History,
  Menu,
  Search,
  X,
} from "lucide-react";
import { AccountMenu } from "./account-menu";
import { useHistory } from "@/components/history/history-context";
import { getToolsByCategory } from "@/config/tools";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user: { email: string; name?: string } | null;
  onAuthSuccess: (u: { email: string; name?: string }) => void;
  onLogout: () => void;
  onOpenAllTools: () => void;
}

const CATEGORY_META: Record<
  string,
  { label: string; promoTitle: string; promoBody: string }
> = {
  dates: {
    label: "Date Calculations",
    promoTitle: "Every date, one click away",
    promoBody: "Add, subtract, count, and compare dates instantly.",
  },
  time: {
    label: "Time",
    promoTitle: "Time, measured simply",
    promoBody: "Timers, stopwatches, and duration tools for any task.",
  },
  timezone: {
    label: "Time & Place",
    promoTitle: "Time connects our world",
    promoBody: "Explore, compare, and plan time across different places.",
  },
  timers: {
    label: "Timers",
    promoTitle: "Never miss a moment",
    promoBody: "Count down, up, and track time your way.",
  },
  all: {
    label: "All Tools",
    promoTitle: "Every tool in one place",
    promoBody: "Browse the complete Date & Time toolkit at a glance.",
  },
};

/* Order of dropdowns in the navbar — "all" comes first */
const NAV_ORDER = ["all", "dates", "timezone", "time", "timers"];

/* ------------------------------------------------------------------ */
/*  Category trigger                                                   */
/* ------------------------------------------------------------------ */
function NavTrigger({
  category,
  active,
  open,
  onEnter,
  onLeave,
}: {
  category: string;
  active: boolean;
  open: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const meta = CATEGORY_META[category] ?? { label: category };

  return (
    <button
      type="button"
      aria-haspopup="true"
      aria-expanded={open}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition",
        "hover:bg-[var(--navbar-hover-bg)] hover:text-[var(--navbar-fg-hover)]",
        (open || active) &&
          "bg-[var(--navbar-active-bg)] text-[var(--navbar-fg-hover)]"
      )}
      style={{
        color: open || active ? "var(--navbar-fg-hover)" : "var(--navbar-fg)",
      }}
    >
      {meta.label}
      <ChevronDown
        size={13}
        className={cn("transition-transform duration-150", open && "rotate-180")}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared dropdown panel                                              */
/* ------------------------------------------------------------------ */
function NavPanel({
  category,
  tools,
  onEnter,
  onLeave,
}: {
  category: string;
  tools: {
    slug: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  }[];
  onEnter: () => void;
  onLeave: () => void;
}) {
  const meta = CATEGORY_META[category] ?? {
    label: category,
    promoTitle: "Explore tools",
    promoBody: "Find the right tool for the job.",
  };

  const isAll = category === "all";
  const panelWidth = isAll
    ? "min(960px, calc(100vw - 32px))"
    : "min(720px, calc(100vw - 32px))";

  return (
    <div
      className="absolute left-0 top-full z-50 pt-2"
      style={{ width: panelWidth }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div
        className="overflow-hidden rounded-2xl border bg-white shadow-2xl"
        style={{ borderColor: "var(--border-card)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_240px]">
          {/* LEFT — tools */}
          <div className="p-5">
            <p
              className="mb-3 text-[10px] font-bold uppercase tracking-[.18em]"
              style={{ color: "var(--purple)" }}
            >
              {meta.label}
              <span
                className="ml-2 font-normal tracking-normal"
                style={{ color: "var(--text-muted)" }}
              >
                ({tools.length})
              </span>
            </p>
            <ul
              className={cn(
                "grid gap-0.5",
                isAll ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2"
              )}
            >
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-[var(--purple-light)]"
                    >
                      <span
                        className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg transition"
                        style={{
                          backgroundColor: "var(--purple-light)",
                          color: "var(--purple)",
                        }}
                      >
                        <Icon size={14} strokeWidth={2.2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className="block truncate text-[12.5px] font-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {tool.name}
                        </span>
                        <span
                          className="mt-0.5 block truncate text-[10.5px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {tool.description}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RIGHT — promo panel */}
          <div
            className="relative hidden flex-col justify-center gap-3 p-6 md:flex"
            style={{
              background: "linear-gradient(160deg, #dff0eb 0%, #c9e6dd 100%)",
            }}
          >
            <div className="relative mx-auto mb-1 grid size-20 place-items-center">
              <div
                className="absolute inset-0 rounded-full opacity-70"
                style={{ backgroundColor: "#a8d5c8" }}
              />
              <div className="relative grid size-12 place-items-center rounded-full bg-white shadow-sm">
                <Clock size={22} style={{ color: "var(--purple)" }} />
              </div>
              <span className="absolute -left-1 top-2 size-3 rounded-full bg-white/80" />
              <span className="absolute -right-2 bottom-2 size-2.5 rounded-full bg-white/80" />
            </div>
            <p
              className="text-center text-[14px] font-extrabold leading-snug tracking-[-.01em]"
              style={{ color: "#0e4a42" }}
            >
              {meta.promoTitle}
            </p>
            <p
              className="text-center text-[11.5px] leading-relaxed"
              style={{ color: "#2c6157" }}
            >
              {meta.promoBody}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Round icon control                                                 */
/* ------------------------------------------------------------------ */
function NavIcon({
  children,
  label,
  onClick,
  badge,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative grid size-9 shrink-0 place-items-center rounded-full transition hover:bg-[var(--navbar-hover-bg)] hover:text-[var(--navbar-fg-hover)]"
      style={{ color: "var(--navbar-fg)" }}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 grid min-w-[16px] place-items-center rounded-full px-1 font-mono text-[9px] font-bold text-white"
          style={{ backgroundColor: "#14a08a" }}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline search                                                      */
/* ------------------------------------------------------------------ */
function InlineSearch() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") inputRef.current?.blur();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative w-full">
      <Search
        size={15}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tools, cities, time zones..."
        aria-label="Search"
        autoComplete="off"
        className="h-10 w-full rounded-full border border-white/10 bg-white pl-10 pr-16 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-white/40 focus:ring-2 focus:ring-white/15"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 sm:block">
        Ctrl K
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main navbar                                                        */
/* ------------------------------------------------------------------ */
export function Navbar({
  user,
  onAuthSuccess,
  onLogout,
  onOpenAllTools,
}: NavbarProps) {
  const pathname = usePathname();
  const { open, entries } = useHistory();

  const [openState, setOpenState] = useState<{
    cat: string;
    path: string;
  } | null>(null);
  const openCategory =
    openState && openState.path === pathname ? openState.cat : null;

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const groups = getToolsByCategory();

  /* Tools for a given category — "all" merges every category */
  const toolsFor = (cat: string) =>
    cat === "all"
      ? Object.values(groups).flat()
      : ((groups as Record<string, unknown>)[cat] as
          | (typeof groups)[keyof typeof groups]
          | undefined) ?? [];

  const handleEnter = (cat: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenState({ cat, path: pathname });
  };
  const handleLeave = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenState(null), 120);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenState(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="sticky top-0 z-40 w-full"
      style={{ backgroundColor: "var(--navbar-bg)" }}
    >
      <div className="relative mx-auto max-w-[1600px] px-3 sm:px-4">
        <header
          className="flex items-center gap-3"
          style={{ height: "var(--navbar-h)" }}
        >
          {/* ---------- Mobile hamburger ---------- */}
          <button
            type="button"
            onClick={onOpenAllTools}
            aria-label="Open menu"
            className="grid size-9 shrink-0 place-items-center rounded-full transition hover:bg-[var(--navbar-hover-bg)] hover:text-[var(--navbar-fg-hover)] lg:hidden"
            style={{ color: "var(--navbar-fg)" }}
          >
            <Menu size={18} />
          </button>

          {/* ---------- Brand ---------- */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-white">
              <Clock
                size={18}
                style={{ color: "var(--purple)" }}
                strokeWidth={2.4}
              />
            </span>
            <span
              className="text-[15px] font-extrabold leading-tight tracking-[-.01em] sm:text-[16px]"
              style={{ color: "var(--navbar-fg-hover)" }}
            >
              Date &amp; Time
            </span>
          </Link>

          {/* ---------- Desktop nav ---------- */}
          <nav
            className="relative ml-3 hidden min-w-0 items-center gap-0.5 lg:flex"
            onMouseLeave={handleLeave}
          >
            {NAV_ORDER.map((cat) => {
              const tools = toolsFor(cat);
              // "All Tools" is a browser, not a route — never mark it active
              const active =
                cat !== "all" &&
                tools.some((t) => pathname === `/tools/${t.slug}`);
              return (
                <NavTrigger
                  key={cat}
                  category={cat}
                  active={active}
                  open={openCategory === cat}
                  onEnter={() => handleEnter(cat)}
                  onLeave={handleLeave}
                />
              );
            })}

            {/* Shared dropdown panel */}
            {openCategory && (
              <NavPanel
                category={openCategory}
                tools={toolsFor(openCategory) as never}
                onEnter={() => handleEnter(openCategory)}
                onLeave={handleLeave}
              />
            )}
          </nav>

          {/* ---------- Desktop search ---------- */}
          <div className="ml-auto hidden min-w-0 max-w-[440px] flex-1 lg:block">
            <InlineSearch />
          </div>

          {/* ---------- Mobile search toggle ---------- */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="Search"
            className="ml-auto grid size-9 shrink-0 place-items-center rounded-full transition hover:bg-[var(--navbar-hover-bg)] hover:text-[var(--navbar-fg-hover)] lg:hidden"
            style={{ color: "var(--navbar-fg)" }}
          >
            {mobileSearchOpen ? <X size={16} /> : <Search size={16} />}
          </button>

          {/* ---------- Right controls ---------- */}
          <div className="ml-1 flex shrink-0 items-center gap-1.5">
            <div className="hidden lg:block">
              <NavIcon label="History" onClick={open} badge={entries.length}>
                <History size={16} />
              </NavIcon>
            </div>

            <AccountMenu
              user={user}
              onAuthSuccess={onAuthSuccess}
              onLogout={onLogout}
            />
          </div>
        </header>
      </div>

      {/* ---------- Mobile search overlay ---------- */}
      {mobileSearchOpen && (
        <div className="relative px-3 pb-3 lg:hidden">
          <div className="mx-auto max-w-[1600px]">
            <InlineSearch />
          </div>
        </div>
      )}
    </div>
  );
}