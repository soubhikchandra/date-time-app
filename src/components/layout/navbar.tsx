import Link from "next/link";

export function Navbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <Link href="/" className="text-lg font-bold text-gray-900">
        🕒 Date &amp; Time Toolkit
      </Link>
      <span className="hidden text-sm text-gray-500 sm:inline">
        {new Date().getFullYear()} · runs in your browser
      </span>
    </header>
  );
}