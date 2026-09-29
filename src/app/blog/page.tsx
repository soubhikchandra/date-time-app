import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | Date & Time Toolkit",
  description: "Notes, tips, and stories about time.",
};

const POSTS = [
  {
    slug: "why-weeks-start-on-monday",
    title: "Why ISO weeks start on Monday",
    excerpt:
      "The story behind ISO 8601 and why the first Thursday of the year defines week one.",
    date: "Coming soon",
  },
  {
    slug: "time-zones-explained",
    title: "Time zones, explained simply",
    excerpt:
      "UTC, IANA names, and daylight saving — the three things to know before converting a meeting.",
    date: "Coming soon",
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-12">
      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[.22em] text-primary">
        <span className="size-1.5 rounded-full bg-accent" />
        Notes
      </p>
      <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-.05em] text-foreground sm:text-5xl">
        Blog
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
        Short reads about dates, time zones, and everything in between.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="tool-card group rounded-3xl border border-border bg-card p-6 transition hover:border-primary/40"
          >
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">
              {post.date}
            </p>
            <h2 className="mt-2 text-lg font-bold text-foreground group-hover:text-primary">
              {post.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {post.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}