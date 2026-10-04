import type { ComponentType } from "react";
import type { CalculatorKey } from "@/types/tools";
import { AgeCalculator } from "./age-calculator";
import { DateDifference } from "./date-difference";
import { AddDays } from "./add-days";
import { SubtractDays } from "./subtract-days";
import { BusinessDays } from "./buisness-days";
import { WeekNumber } from "./week-number";
import { TimezoneConverter } from "./timezone-converter/timezone-converter";
import { WorldClock } from "./world-clock";
import { UnixTimestamp } from "./unix-timestamp";
import { Countdown } from "./countdown";
import { Stopwatch } from "./stopwatch";
import { Calendar } from "./calendar";
import { TimezoneDifference } from "./timezone-difference";
import { SunriseSunset } from "./sunrise-sunset"; 
import { FestivalCalendar } from "./festival-calendar";
import { FiscalQuarter } from "./fiscal-quarter";
import { DateRange } from "./date-range";
import { LunarPhase } from "./lunar-phase";

export const CALCULATOR_REGISTRY: Partial<Record<CalculatorKey, ComponentType>> = {
  "age-calculator": AgeCalculator,
  "date-difference": DateDifference,
  "add-days": AddDays,
  "subtract-days": SubtractDays,
  "business-days": BusinessDays,
  "week-number": WeekNumber,
  "timezone-converter": TimezoneConverter,
  "world-clock": WorldClock,
  "unix-timestamp": UnixTimestamp,
  "countdown": Countdown,
  "stopwatch": Stopwatch,
  "calendar": Calendar,
  "timezone-difference": TimezoneDifference,
  "sunrise-sunset": SunriseSunset,
  "festival-calendar": FestivalCalendar,
  "fiscal-quarter": FiscalQuarter,
  "date-range": DateRange,
  "lunar-phase": LunarPhase,
};