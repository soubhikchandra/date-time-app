import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Date & Time",
  description: "How Date & Time uses cookies and local storage.",
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-[760px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-12">
      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[.22em] text-primary">
        <span className="size-1.5 rounded-full bg-accent" />
        Legal
      </p>
      <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-.05em] text-foreground sm:text-5xl">
        Cookie Policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="tool-card mt-8 space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <section>
          <h2 className="text-lg font-bold text-foreground">No cookies</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Date &amp; Time does not set any cookies. We use browser local storage
  only to remember your theme preference.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Local storage</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            A single key (<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">dtt-theme</code>) stores whether you
            prefer light or dark mode. You can clear it any time from your
            browser settings.
          </p>
        </section>
      </div>
    </div>
  );
}