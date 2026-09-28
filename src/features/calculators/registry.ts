import type { ComponentType } from "react";
import type { CalculatorKey } from "@/types/tools";
import { AgeCalculator } from "./age-calculator";

/**
 * Every calculator the dynamic route can render.
 * Add one line here when a new calculator is ready — no new route needed.
 */
export const CALCULATOR_REGISTRY: Partial<Record<CalculatorKey, ComponentType>> = {
  "age-calculator": AgeCalculator,
};