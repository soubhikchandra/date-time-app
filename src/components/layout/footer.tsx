import Link from "next/link";
import { Clock3 } from "lucide-react";

const LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Terms", href: "/terms" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-border bg-card/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="relative grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Clock3 size={13} />
            <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-accent" />
          </span>
          <div className="flex items-baseline gap-2">
            <strong className="text-sm font-extrabold tracking-[-.03em]">
              Date &amp; Time
            </strong>
            <span className="font-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">
              © {year}
            </span>
          </div>
        </div>

        {/* Links */}
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right meta */}
        <span className="hidden font-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground lg:inline">
          Runs locally
        </span>
      </div>
    </footer>
  );
}