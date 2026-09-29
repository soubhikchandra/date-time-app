"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
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
      const haystack = `${tool.name} ${tool.description} ${tool.category}`.toLowerCase();
      return haystack.includes(q);
    }).slice(0, 8);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Reset active index inline when the user types — no effect needed.
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
      if (e.key === "Enter" && results.length > 0) {
        go(results[0].slug);
      }
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
    <div ref={containerRef} className="relative min-w-0 flex-1 max-w-md">
      {/* Input */}
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search tools…"
          aria-label="Search tools"
          autoComplete="off"
          className="h-9 w-full rounded-xl border border-input bg-background/70 pl-9 pr-9 text-sm shadow-sm transition placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No tools match{" "}
              <strong className="text-foreground">&ldquo;{query}&rdquo;</strong>.
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
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-lg",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon size={15} strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">
                          {tool.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
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
            <div className="flex items-center justify-between border-t border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
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