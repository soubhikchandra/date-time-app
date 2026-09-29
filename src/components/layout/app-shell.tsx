"use client";

import { useEffect, useState } from "react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { Footer } from "./footer";
import { HistoryProvider } from "@/components/history/history-context";
import { HistoryPopup } from "@/components/history/history-popup";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

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
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar open={open} onClose={() => setOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onMenuClick={() => setOpen(true)} />
          <main className="min-w-0 flex-1">{children}</main>
          <Footer />
        </div>

        {open && (
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
            aria-hidden="true"
          />
        )}

        <HistoryPopup />
      </div>
    </HistoryProvider>
  );
}