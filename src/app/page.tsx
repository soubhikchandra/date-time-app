import Link from "next/link";
import { TOOLS } from "@/config/tools";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-8">
      <h1 className="mb-2 text-3xl font-bold">Date &amp; Time Toolkit</h1>
      <p className="mb-8 text-gray-500">
        {TOOLS.length} calculators — pick one to get started.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group rounded-lg border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">{tool.name}</h2>
              <p className="mt-1 text-sm text-gray-500">{tool.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}