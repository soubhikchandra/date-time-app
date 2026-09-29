import { getToolBySlug } from "@/config/tools";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  dates: "Dates",
  time: "Time",
  timezone: "Time & Place",
  timers: "Timers",
};

interface ToolCardHeaderProps {
  slug: string;
  className?: string;
}

export function ToolCardHeader({ slug, className }: ToolCardHeaderProps) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;

  const Icon = tool.icon;

  return (
    <div className={cn("mb-7 flex items-start gap-4", className)}>
      <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon size={23} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[.18em] text-primary">
          Toolkit / {CATEGORY_LABELS[tool.category] ?? tool.category}
        </p>
        <h2 className="text-2xl font-extrabold tracking-[-.04em] text-foreground sm:text-3xl">
          {tool.name}
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
          {tool.description}
        </p>
      </div>
    </div>
  );
}