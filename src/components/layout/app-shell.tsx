// src/components/layout/app-shell.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { MobileSidebar } from "./mobile-sidebar";
import { HistoryProvider } from "@/components/history/history-context";
import { HistoryPopup } from "@/components/history/history-popup";

interface AccountUser {
  email: string;
  name?: string;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    } catch {}
    router.refresh();
  };

  return (
    <HistoryProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar
          user={user}
          onAuthSuccess={handleAuthSuccess}
          onLogout={handleLogout}
          onOpenAllTools={() => setMenuOpen(true)}
        />
        <main className="min-w-0 flex-1">{children}</main>
        <Footer />
        <HistoryPopup />

        {/* Drawer instead of the old modal */}
        <MobileSidebar
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      </div>
    </HistoryProvider>
  );
}