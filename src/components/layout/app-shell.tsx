"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { Footer } from "./footer";
import { HistoryProvider } from "@/components/history/history-context";
import { HistoryPopup } from "@/components/history/history-popup";

interface AccountUser {
  email: string;
  name?: string;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AccountUser | null>(null);

  // Load current user on mount
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.user) {
          setUser({ email: data.user.email, name: data.user.name });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAuthSuccess = (u: { email: string; name?: string }) => {
    setUser(u);
    router.refresh();
  };

  const handleLogout = async () => {
    setUser(null);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });
    } catch {
      /* ignore */
    }
    router.refresh();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <HistoryProvider>
      <div className="app-frame mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar open={open} onClose={() => setOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar
            onMenuClick={() => setOpen(true)}
            user={user}
            onAuthSuccess={handleAuthSuccess}
            onLogout={handleLogout}
          />
          <main className="min-w-0 flex-1">{children}</main>
          <Footer />
        </div>

        {open && (
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-foreground/20 desktop:hidden"
            aria-hidden="true"
          />
        )}

        <HistoryPopup />
      </div>
    </HistoryProvider>
  );
}