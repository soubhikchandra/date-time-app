import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getToolBySlug, TOOLS, } from "@/config/tools";
import { CALCULATOR_REGISTRY } from "@/features/calculators/registry";
import { CalculatorLayout } from "@/components/layout/calculator-layout";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: "Tool not found" };
  return { title: `${tool.name} | Date & Time Toolkit`, description: tool.description };
}

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