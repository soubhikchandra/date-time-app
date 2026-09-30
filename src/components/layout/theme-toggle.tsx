"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  window.addEventListener("storage", callback);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export function useTheme() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem("dtt-theme", next ? "dark" : "light");
    } catch {
      /* storage blocked */
    }
  };

  return { dark, toggle };
}

// components/layout/theme-toggle.tsx  (only the ThemeToggle export)
export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="grid size-11 place-items-center rounded-full bg-white text-[#554CC4] shadow-[0_2px_8px_rgba(55,61,147,0.08)] transition hover:bg-[#F0EEFF]"
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}