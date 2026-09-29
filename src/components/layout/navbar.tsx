"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border bg-background/82 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle menu"
          className="grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground lg:hidden"
        >
          <Menu size={18} />
        </button>

        <Link href="/" className="flex items-center gap-3">
          <span className="relative grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/15">
            🕒
            <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-accent" />
          </span>
          <span className="hidden sm:block">
            <strong className="block text-sm font-extrabold tracking-[-.03em]">
              minutehand
            </strong>
            <small className="font-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">
              date &amp; time toolkit
            </small>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-xs font-semibold text-muted-foreground sm:inline">
          Runs locally in your browser
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}