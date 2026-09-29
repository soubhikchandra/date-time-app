import type { ComponentType } from "react";
import type { CalculatorKey } from "@/types/tools";
import { AgeCalculator } from "./age-calculator";
import { DateDifference } from "./date-difference";

//  Every calculator the dynamic route can render.

export const CALCULATOR_REGISTRY: Partial<Record<CalculatorKey, ComponentType>> = {
  "age-calculator": AgeCalculator,
  "date-difference": DateDifference,
};