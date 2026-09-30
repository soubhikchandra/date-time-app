// components/layout/navbar.tsx
"use client";

import { History, Menu, Moon, Sun } from "lucide-react";
import { AccountMenu } from "./account-menu";
import { SearchBar } from "./search-bar";
import { useHistory } from "@/components/history/history-context";
import { useTheme } from "./theme-toggle";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onMenuClick: () => void;
  user: { email: string; name?: string } | null;
  onAuthSuccess: (u: { email: string; name?: string }) => void;
  onLogout: () => void;
}

function CircleButton({
  children,
  label,
  onClick,
  badge,
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "nav-icon-btn relative grid size-11 shrink-0 place-items-center rounded-full",
        className
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full px-1 font-mono text-[9px] font-bold text-white ring-2"
          style={{
            backgroundColor: "var(--accent-bright)",
            // @ts-expect-error css var for ring
            "--tw-ring-color": "var(--surface-navbar)",
          }}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

export function Navbar({
  onMenuClick,
  user,
  onAuthSuccess,
  onLogout,
}: NavbarProps) {
  const { open, entries } = useHistory();
  const { dark, toggle } = useTheme();

  return (
    <div className="sticky top-1 z-20 px-3 sm:px-4">
      <header
        className={cn(
          "surface-navbar flex flex-col gap-3 rounded-[30px] px-4 py-2.5",
          "sm:h-[72px] sm:flex-row sm:items-center sm:gap-4 sm:py-0 lg:gap-5"
        )}
      >
        {/* --------------------------------------------------------- */}
        {/* Row 1 (mobile/tablet) / Left: brand + search              */}
        {/* --------------------------------------------------------- */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Hamburger — visible below 1444px */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="grid size-12 shrink-0 place-items-center rounded-full sm:size-11 min-[1444px]:hidden"
            style={{
              backgroundColor: "var(--surface-card)",
              color: "var(--purple)",
              border: "1px solid var(--border-soft)",
            }}
          >
            <Menu className="size-5 sm:size-[18px]" />
          </button>

          {/* Brand logo — desktop only (≥1444px) */}
          <span
            className="hidden size-[40px] shrink-0 place-items-center rounded-2xl min-[1444px]:grid"
            style={{
              backgroundColor: "#F4F3FF",
              boxShadow:
                "0 4px 14px rgba(106,85,255,0.25), inset 0 1px 0 rgba(255,255,255,0.95)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-logo.png"
              alt="Date & Time logo"
              draggable={false}
              className="size-full select-none object-contain p-[2px]"
            />
          </span>

          {/* Brand text — desktop only (≥1444px) */}
          <p
            className="hidden shrink-0 truncate text-[19px] font-bold leading-tight tracking-[-.02em] min-[1444px]:block"
            style={{ color: "var(--text-primary)" }}
          >
            Date &amp; Time
          </p>

          {/* Search */}
          <div className="flex min-w-0 flex-1 justify-start">
            <SearchBar />
          </div>

          {/* Mobile + tablet inline: History + Account (below 1444px) */}
          <div className="flex items-center gap-2 min-[1444px]:hidden">
            <CircleButton
              label="History"
              onClick={open}
              badge={entries.length}
            >
              <History size={17} />
            </CircleButton>
            <AccountMenu
              user={user}
              onAuthSuccess={onAuthSuccess}
              onLogout={onLogout}
            />
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* Right controls — desktop only (≥1444px)                    */}
        {/* --------------------------------------------------------- */}
        <div className="hidden shrink-0 items-center gap-2 min-[1444px]:flex">
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className={cn(
              "nav-icon-btn relative grid size-11 shrink-0 place-items-center rounded-full",
              dark && "nav-icon-btn--active"
            )}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <CircleButton label="History" onClick={open} badge={entries.length}>
            <History size={17} />
          </CircleButton>

          <AccountMenu
            user={user}
            onAuthSuccess={onAuthSuccess}
            onLogout={onLogout}
          />
        </div>
      </header>
    </div>
  );
}