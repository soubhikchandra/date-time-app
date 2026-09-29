"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getToolsByCategory } from "@/config/tools";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  dates: "Dates",
  time: "Time",
  timezone: "Time & place",
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
        "sidebar-pattern fixed inset-y-0 left-0 z-40 w-[280px] shrink-0 overflow-y-auto border-r border-border bg-card/92 px-4 py-5 backdrop-blur-xl transition-transform",
        "lg:sticky lg:top-[68px] lg:z-auto lg:h-[calc(100dvh-68px)] lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="mb-5 flex items-center justify-between lg:hidden">
        <span className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">
          Menu
        </span>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <nav className="space-y-6">
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
    </aside>
  );
}