// src/components/layout/account-menu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity as ActivityIcon,
  LogOut,
  User,
  UserPlus,
} from "lucide-react";
import { AuthModal } from "../auth/auth-modal";
import { ActivityModal } from "./activity-modal";

interface Activity {
  tool: string;
  toolName: string;
  summary: string;
  details: Record<string, string>;
  timestamp: string;
}

interface AccountUser {
  email: string;
  name?: string;
  createdAt?: string;
  activities?: Activity[];
}

interface AccountMenuProps {
  user: AccountUser | null;
  onAuthSuccess: (u: { email: string; name?: string }) => void;
  onLogout: () => void;
}

export function AccountMenu({ user, onAuthSuccess, onLogout }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [activityOpen, setActivityOpen] = useState(false);
  const [profile, setProfile] = useState<AccountUser | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (!open || !user) return;
    fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setProfile(data.user);
      })
      .catch(() => {});
  }, [open, user]);

  const initial =
    (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();

  const openAuth = () => {
    setAuthMode("signup");
    setAuthOpen(true);
    setOpen(false);
  };

  const openActivity = () => {
    setActivityOpen(true);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Account icon — dark-navbar variant */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account"
        aria-expanded={open}
        className="grid size-9 shrink-0 place-items-center rounded-full text-white transition hover:brightness-110"
        // style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
        style={{ backgroundColor: "var(--navbar-active-bg)" }}
      >
        {user ? (
          <span className="text-[12px] font-bold">{initial}</span>
        ) : (
          <User size={16} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          {user ? (
            <>
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-bold text-foreground">
                  {profile?.name || user.name || "—"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {profile?.email || user.email}
                </p>
              </div>

              <div className="space-y-1 p-2">
                <button
                  type="button"
                  onClick={openActivity}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <ActivityIcon size={15} />
                  View activity
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-destructive"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-1 p-2">
              <button
                type="button"
                onClick={openAuth}
                className="flex w-full items-center gap-3 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition hover:brightness-105"
              >
                <UserPlus size={15} />
                Register
              </button>
            </div>
          )}
        </div>
      )}

      <AuthModal
        key={authMode}
        isOpen={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={(u) => {
          setAuthOpen(false);
          onAuthSuccess(u);
        }}
      />

      <ActivityModal
        isOpen={activityOpen}
        activities={profile?.activities ?? []}
        onClose={() => setActivityOpen(false)}
      />
    </div>
  );
}