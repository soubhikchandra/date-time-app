import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | Date & Time Toolkit",
  description: "Get in touch with minutehand.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[760px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-12">
      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[.22em] text-primary">
        <span className="size-1.5 rounded-full bg-accent" />
        Say hello
      </p>
      <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-.05em] text-foreground sm:text-5xl">
        Contact
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
        Feedback, bug reports, or feature ideas — we read everything.
      </p>

      <div className="tool-card mt-8 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2 sm:p-8">
        <a
          href="mailto:hello@example.com"
          className="flex items-start gap-3 rounded-2xl border border-border bg-background/60 p-4 transition hover:border-primary/40"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Mail size={16} />
          </span>
          <div>
            <strong className="block text-sm text-foreground">Email</strong>
            <span className="text-xs text-muted-foreground">
              hello@example.com
            </span>
          </div>
        </a>

        <a
          href="https://twitter.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-3 rounded-2xl border border-border bg-background/60 p-4 transition hover:border-primary/40"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <MessageCircle size={16} />
          </span>
          <div>
            <strong className="block text-sm text-foreground">Social</strong>
            <span className="text-xs text-muted-foreground">
              @minutehand
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}