"use client";

import Link from "next/link";
import { Menu} from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="text-lg font-bold text-gray-900">
          🕒 Date &amp; Time Toolkit
        </Link>
      </div>

      <span className="hidden text-sm text-gray-500 sm:inline">
        {new Date().getFullYear()} · runs in your browser
      </span>
    </header>
  );
}