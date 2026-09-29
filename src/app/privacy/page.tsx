import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Date & Time ",
  description: "How Date & Time handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[760px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-12">
      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[.22em] text-primary">
        <span className="size-1.5 rounded-full bg-accent" />
        Legal
      </p>
      <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-.05em] text-foreground sm:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="tool-card mt-8 space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <section>
          <h2 className="text-lg font-bold text-foreground">Your data stays with you</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
  All calculations run entirely in your browser. We do not send your
  dates, times, or saved history to any server.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">What we store</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your theme preference is stored in your browser&apos;s local storage.
            Saved history lives in memory and clears when you reload the page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Third parties</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We do not use analytics, advertising, or tracking scripts.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Contact</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Questions? Reach us at{" "}
            <a href="mailto:hello@example.com" className="font-medium text-primary hover:underline">
              hello@example.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}