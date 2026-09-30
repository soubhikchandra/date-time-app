// // components/layout/search-bar.tsx
// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Search } from "lucide-react";
// import { TOOLS } from "@/config/tools";
// import { cn } from "@/lib/utils";

// export function SearchBar() {
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

//   const handleChange = (value: string) => {
//     setQuery(value);
//     setActiveIndex(0);
//     setOpen(true);
//   };

//   const go = (slug: string) => {
//     setQuery("");
//     setOpen(false);
//     inputRef.current?.blur();
//     router.push(`/tools/${slug}`);
//   };

//   const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Escape") {
//       setQuery("");
//       setOpen(false);
//       inputRef.current?.blur();
//       return;
//     }
//     if (!open || results.length === 0) {
//       if (e.key === "Enter" && results.length > 0) go(results[0].slug);
//       return;
//     }
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setActiveIndex((i) => (i + 1) % results.length);
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setActiveIndex((i) => (i - 1 + results.length) % results.length);
//     } else if (e.key === "Enter") {
//       e.preventDefault();
//       go(results[activeIndex].slug);
//     }
//   };

//   return (
//     <div ref={containerRef} className="relative w-full max-w-[560px] min-w-0">
//       <div className="relative">
//         <Search
//           size={16}
//           className="nav-search-icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
//         />

//         <input
//           ref={inputRef}
//           type="search"
//           value={query}
//           onChange={(e) => handleChange(e.target.value)}
//           onFocus={() => query && setOpen(true)}
//           onKeyDown={onKeyDown}
//           placeholder="Search tools..."
//           aria-label="Search tools"
//           autoComplete="off"
//           className="nav-search h-11 w-full rounded-full pl-11 pr-11 text-sm outline-none transition"
//         />

//         {query && (
//           <button
//             type="button"
//             onClick={() => {
//               setQuery("");
//               inputRef.current?.focus();
//             }}
//             aria-label="Clear search"
//             className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-[#7E83AF] transition-colors hover:bg-[#F0EEFF] hover:text-[#554CC4]"
//           >
//             {/* <X size={14} /> */}
//           </button>
//         )}
//       </div>

//       {open && query.trim() && (
//         <div
//           className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl shadow-xl"
//           style={{
//             backgroundColor: "#F9FAFE",
//             border: "1px solid #DDE1F4",
//           }}
//         >
//           {results.length === 0 ? (
//             <div className="p-4 text-sm text-[#7E83AF]">
//               No tools match{" "}
//               <strong className="text-[#0B0D40]">&ldquo;{query}&rdquo;</strong>.
//             </div>
//           ) : (
//             <ul className="max-h-80 overflow-y-auto p-1.5">
//               {results.map((tool, i) => {
//                 const Icon = tool.icon;
//                 const active = i === activeIndex;
//                 return (
//                   <li key={tool.slug}>
//                     <button
//                       type="button"
//                       onMouseEnter={() => setActiveIndex(i)}
//                       onClick={() => go(tool.slug)}
//                       className={cn(
//                         "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
//                         active
//                           ? "bg-[#F0EEFF] text-[#554CC4]"
//                           : "text-[#0B0D40] hover:bg-[#F0EEFF]",
//                       )}
//                     >
//                       <span
//                         className={cn(
//                           "grid size-8 shrink-0 place-items-center rounded-lg",
//                           active
//                             ? "bg-[#554CC4] text-white"
//                             : "bg-[#EEF0FC] text-[#554CC4]",
//                         )}
//                       >
//                         <Icon size={15} strokeWidth={1.9} />
//                       </span>
//                       <span className="min-w-0 flex-1">
//                         <span className="block truncate text-sm font-bold">
//                           {tool.name}
//                         </span>
//                         <span className="block truncate text-xs text-[#7E83AF]">
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
//             <div
//               className="flex items-center justify-between px-3 py-2 font-mono text-[10px] uppercase tracking-[.18em] text-[#7E83AF]"
//               style={{ borderTop: "1px solid #DDE1F4" }}
//             >
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

// components/layout/search-bar.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { TOOLS } from "@/config/tools";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return TOOLS.filter((tool) => {
      const haystack =
        `${tool.name} ${tool.description} ${tool.category}`.toLowerCase();
      return haystack.includes(q);
    }).slice(0, 8);
  }, [query]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
    setOpen(true);
  };

  const go = (slug: string) => {
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
    router.push(`/tools/${slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open || results.length === 0) {
      if (e.key === "Enter" && results.length > 0) go(results[0].slug);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[activeIndex].slug);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[560px] min-w-0"
    >
      <div className="relative">
        <Search
          size={16}
          className="nav-search-icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search tools..."
          aria-label="Search tools"
          autoComplete="off"
          className="nav-search h-11 w-full rounded-full pl-11 pr-9 text-sm outline-none transition"
        />
      </div>

      {/* --------------------------------------------------------- */}
      {/* Dropdown — theme-aware                                     */}
      {/* --------------------------------------------------------- */}
      {open && query.trim() && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl shadow-xl"
          style={{
            backgroundColor: "var(--surface-card)",
            border: "1px solid var(--border-soft)",
          }}
        >
          {results.length === 0 ? (
            <div
              className="p-4 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              No tools match{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                &ldquo;{query}&rdquo;
              </strong>
              .
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-1.5">
              {results.map((tool, i) => {
                const Icon = tool.icon;
                const active = i === activeIndex;
                return (
                  <li key={tool.slug}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => go(tool.slug)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition"
                      )}
                      style={
                        active
                          ? {
                              backgroundColor: "var(--purple-light)",
                              color: "var(--purple)",
                            }
                          : {
                              backgroundColor: "transparent",
                              color: "var(--text-primary)",
                            }
                      }
                    >
                      <span
                        className="grid size-8 shrink-0 place-items-center rounded-lg transition"
                        style={
                          active
                            ? {
                                backgroundColor: "var(--purple)",
                                color: "#FFFFFF",
                              }
                            : {
                                backgroundColor: "var(--purple-light)",
                                color: "var(--purple)",
                              }
                        }
                      >
                        <Icon size={15} strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className="block truncate text-sm font-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {tool.name}
                        </span>
                        <span
                          className="block truncate text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {tool.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {results.length > 0 && (
            <div
              className="flex items-center justify-between px-3 py-2 font-mono text-[10px] uppercase tracking-[.18em]"
              style={{
                color: "var(--text-muted)",
                borderTop: "1px solid var(--border-soft)",
              }}
            >
              <span>↑ ↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}