"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getToolsByCategory } from "@/config/tools";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  dates: "Dates",
  time: "Time",
  timezone: "Time Zones",
  timers: "Timers",
};

export function Sidebar() {
  const pathname = usePathname();
  const groups = getToolsByCategory();

  return (
    <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4 md:block">
      <nav className="space-y-6">
        {Object.entries(groups).map(([category, tools]) => (
          <div key={category}>
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {CATEGORY_LABELS[category] ?? category}
            </p>
            <ul className="space-y-1">
              {tools.map((tool) => {
                const href = `/tools/${tool.slug}`;
                const active = pathname === href;
                const Icon = tool.icon;
                return (
                  <li key={tool.slug}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                        active
                          ? "bg-blue-50 font-medium text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tool.name}
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