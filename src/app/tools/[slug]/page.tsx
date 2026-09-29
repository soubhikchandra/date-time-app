// appp/tools/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";//follow rules of  Next.js's metadata format.
import { getToolBySlug, TOOLS, } from "@/config/tools";
import { CALCULATOR_REGISTRY } from "@/features/calculators/registry";
import { CalculatorLayout } from "@/components/layout/calculator-layout";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}//create the params ahead of time.

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: "Tool not found" };
  return { title: `${tool.name} | Date & Time Toolkit`, description: tool.description };

}//dynamically creates the HTML metadata for each calculator page.Next.js puts it into the page's HTML <head>.

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const Calculator = CALCULATOR_REGISTRY[tool.calculator];

  return (
    <CalculatorLayout title={tool.name} description={tool.description}>
      {Calculator ? (
        <Calculator />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          <p className="font-medium">Coming soon</p>
          <p className="text-sm">This calculator is not implemented yet.</p>
        </div>
      )}
    </CalculatorLayout>
  );
}


/* 
1. params: Promise<{ slug: string }>; the params coming later so it is promise.
2. Next.js connects it automatically (generateMetadata) with the HTML head.
3.slug is the URL-friendly for identifier the tool 



*/