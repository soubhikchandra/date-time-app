import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Date & Time",
  description: "Terms for using Date & Time.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[760px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-12">
      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[.22em] text-primary">
        <span className="size-1.5 rounded-full bg-accent" />
        Legal
      </p>
      <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-.05em] text-foreground sm:text-5xl">
        Terms of Use
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="tool-card mt-8 space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <section>
          <h2 className="text-lg font-bold text-foreground">Free to use</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
  Date &amp; Time is provided as-is, free of charge, for personal and
  commercial use.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">No warranty</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Calculations are provided for informational purposes. Always verify
            critical dates against authoritative sources.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Acceptable use</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Do not attempt to disrupt or abuse the service.
          </p>
        </section>
      </div>
    </div>
  );
}