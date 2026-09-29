"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Clock3, X } from "lucide-react";
import { getToolsByCategory } from "@/config/tools";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  dates: "Dates",
  time: "Time",
  timezone: "Time & Place",
  timers: "Timers",
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const groups = getToolsByCategory();

  return (
    <aside
      className={cn(
        "sidebar-pattern fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-transform",
        "lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-border px-5 py-5">
        <Link href="/" onClick={onClose} className="flex items-center gap-3">
          <span className="relative grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/15">
            <Clock3 size={20} />
            <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-accent" />
          </span>
          <span>
            <strong className="block text-sm font-extrabold tracking-[-.03em]">
              minutehand
            </strong>
            <small className="font-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">
              date &amp; time toolkit
            </small>
          </span>
        </Link>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        {Object.entries(groups).map(([category, tools]) => (
          <div key={category}>
            <p className="mb-2 px-3 font-mono text-[10px] font-medium uppercase tracking-[.2em] text-muted-foreground">
              {CATEGORY_LABELS[category] ?? category}
            </p>
            <ul className="grid gap-1">
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
                        "tool-nav-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-bold">
                        {tool.name}
                      </span>
                      {active && <ChevronRight size={14} />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-border px-5 py-4 text-xs text-muted-foreground">
        <span className="size-2 rounded-full bg-accent" />
        Runs locally in your browser
      </div>
    </aside>
  );
}