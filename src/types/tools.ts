import type { LucideIcon } from "lucide-react";

export type ToolCategory = "dates" | "time" | "timezone" | "timers";

export type CalculatorKey =
  | "age-calculator"
  | "date-difference"
  | "add-days"
  | "subtract-days"
  | "business-days"
  | "timezone-converter"
  | "unix-timestamp"
  | "countdown"
  | "stopwatch"
  | "world-clock"
  | "week-number"
  | "calendar";

export interface ToolConfig {
  slug: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: LucideIcon;
  calculator: CalculatorKey;
}
