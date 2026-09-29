"use client";

import { useEffect, useRef, useState } from "react";
import { LogIn, Moon, Sun, User, UserPlus } from "lucide-react";
import { useTheme } from "./theme-toggle";

export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { dark, toggle } = useTheme();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <User size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {/* Mobile-only: theme toggle inside account menu */}
          <div className="border-b border-border p-2 lg:hidden">
            <button
              type="button"
              onClick={toggle}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
              <span className="flex-1 text-left font-medium">
                {dark ? "Light mode" : "Dark mode"}
              </span>
            </button>
          </div>

          {/* Account actions */}
          <div className="space-y-1 p-2">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition hover:brightness-105"
            >
              <UserPlus size={15} />
              Register
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <LogIn size={15} />
              Sign in
            </button>
          </div>
        </div>
      )}
    </div>
  );
}