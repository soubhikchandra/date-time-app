import {
  Cake,
  CalendarRange,
  CalendarPlus,
  CalendarMinus,
  Briefcase,
  Globe,
  Sunrise,
  Clock,
  Timer,
  Watch,
  Earth,
  CalendarDays,
  ArrowLeftRight,
  Sparkles,
  ListOrdered,
} from "lucide-react";
import type { ToolConfig } from "@/types/tools";


export const TOOLS: ToolConfig[] = [
  { slug: "age-calculator",     name: "Age Calculator",            category: "dates",    description: "Find your exact age in years, months, and days.",      icon: Cake,          calculator: "age-calculator" },
  { slug: "date-difference",    name: "Date Difference",           category: "dates",    description: "Calculate days, weeks, and months between two dates.", icon: CalendarRange, calculator: "date-difference" },
  { slug: "add-days",           name: "Add Days to Date",          category: "dates",    description: "Add any number of days to a given date.",              icon: CalendarPlus,  calculator: "add-days" },
  { slug: "subtract-days",      name: "Subtract Days",             category: "dates",    description: "Subtract days from a date.",                           icon: CalendarMinus, calculator: "subtract-days" },
  { slug: "business-days",      name: "Business Days Calculator",  category: "dates",    description: "Count working days between two dates.",                icon: Briefcase,     calculator: "business-days" },
  { slug: "timezone-converter", name: "Time Zone Converter",       category: "timezone", description: "Convert a time from one timezone to another.",         icon: Globe,         calculator: "timezone-converter" },
  { slug: "unix-timestamp",     name: "Unix Timestamp Converter",  category: "time",     description: "Convert between Unix timestamps and human dates.",     icon: Clock,         calculator: "unix-timestamp" },
  { slug: "countdown",          name: "Countdown Timer",           category: "timers",   description: "Count down to a specific date or duration.",           icon: Timer,         calculator: "countdown" },
  { slug: "stopwatch",          name: "Stopwatch",                 category: "timers",   description: "Start, pause, and reset a stopwatch.",                 icon: Watch,         calculator: "stopwatch" },
  { slug: "world-clock",        name: "World Clock",               category: "timezone", description: "See current time across multiple cities.",             icon: Earth,         calculator: "world-clock" },
  { slug: "week-number",        name: "Week Number Calculator",    category: "dates",    description: "Find the ISO week number for any date.",               icon: CalendarDays,  calculator: "week-number" },
  { slug: "calendar",           name: "Calendar & Festivals",      category: "timezone", description: "Explore public holidays and festivals by country.",    icon: CalendarDays,  calculator: "calendar" },
  { slug: "timezone-difference",name: "Time Zone Difference",      category: "timezone", description: "See how many hours ahead or behind any two time zones are.", icon: ArrowLeftRight, calculator: "timezone-difference" },
  { slug: "sunrise-sunset",     name: "Sunrise & Sunset",          category: "timezone", description: "Sunrise, sunset, and twilight times for any city.",  icon: Sunrise,      calculator: "sunrise-sunset" },
  { slug: "festival-calendar",  name: "Festival Calendar",         category: "timezone", description: "All festivals from every religion in one filterable calendar.", icon: Sparkles, calculator: "festival-calendar" },
  { slug: "fiscal-quarter", name: "Fiscal Quarter Calculator", category: "dates", description: "Find the current fiscal quarter for any fiscal year start.", icon: CalendarRange, calculator: "fiscal-quarter" },
  { slug: "date-range", name: "Date Range Calculator", category: "dates", description: "List every date between two dates, with filters.", icon: ListOrdered, calculator: "date-range" },
];



export const getToolBySlug = (slug: string) => TOOLS.find((t)=>t.slug === slug);

export const getToolsByCategory = (): Record<string, ToolConfig[]> =>
  TOOLS.reduce<Record<string, ToolConfig[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

// slug is identifire tool on URL then it find the Tool key then get the correct component.


