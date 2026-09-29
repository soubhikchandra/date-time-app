import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

const SLUGS = ["why-weeks-start-on-monday", "time-zones-explained"];

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  if (!SLUGS.includes(slug)) notFound();

  return (
    <div className="mx-auto max-w-[760px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-12">
      <Link
        href="/blog"
        className="font-mono text-[10px] uppercase tracking-[.2em] text-primary hover:underline"
      >
        ← Back to blog
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-[-.05em] text-foreground sm:text-4xl">
        {slug.replace(/-/g, " ")}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        This post is coming soon.
      </p>
    </div>
  );
}