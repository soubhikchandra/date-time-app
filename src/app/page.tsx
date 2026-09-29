import Link from "next/link";
import { TOOLS } from "@/config/tools";

export default function Home() {
  return (
    <div className="mx-auto max-w-[1120px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-12">
      {/* Hero header */}
      <header className="mb-9">
        <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[.22em] text-primary">
          <span className="size-1.5 rounded-full bg-accent" />
          The answer is closer than you think
        </p>

        <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.02] tracking-[-.065em] text-foreground sm:text-5xl">
          Date &amp; Time <span className="text-primary">Toolkit.</span>
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          {TOOLS.length} calculators — pick one to get started.
        </p>
      </header>

      {/* Tools grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="tool-card group rounded-3xl border border-border bg-card p-5 transition hover:border-primary/40"
            >
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon size={18} strokeWidth={1.9} />
              </div>
              <h2 className="text-base font-bold text-foreground">
                {tool.name}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {tool.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}