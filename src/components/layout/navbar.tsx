"use client";

import { History, Menu } from "lucide-react";
import { AccountMenu } from "./account-menu";
import { SearchBar } from "./search-bar";
import { useHistory } from "@/components/history/history-context";

interface NavbarProps {
  onMenuClick: () => void;
  user: { email: string; name?: string } | null;
  onAuthSuccess: (u: { email: string; name?: string }) => void;
  onLogout: () => void;
}

export function Navbar({
  onMenuClick,
  user,
  onAuthSuccess,
  onLogout,
}: NavbarProps) {
  const { open, entries } = useHistory();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur-xl sm:gap-3 sm:px-5">
      {/* Hamburger — mobile / tablet only */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Search — grows to fill free space */}
      <SearchBar />

      {/* Right icons — pinned right */}
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={open}
          aria-label="History"
          className="relative grid size-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <History size={16} />
          {entries.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-[16px] place-items-center rounded-full bg-accent px-1 font-mono text-[9px] font-bold text-accent-foreground">
              {entries.length > 9 ? "9+" : entries.length}
            </span>
          )}
        </button>

        <AccountMenu
          user={user}
          onAuthSuccess={onAuthSuccess}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}