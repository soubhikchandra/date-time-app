// "use client";

// import { DayPicker } from "react-day-picker";
// import { cn } from "@/lib/utils";

// export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// export function Calendar({ className, classNames, ...props }: CalendarProps) {
//   return (
//     <DayPicker
//       showOutsideDays
//       className={cn("p-3", className)}
//       classNames={{
//         months: "relative flex flex-col sm:flex-row gap-4",
//         month: "space-y-4",
//         month_caption: "flex justify-center pt-1 relative items-center h-9",
//         caption_label: "text-sm font-bold text-foreground",
//         nav: "absolute inset-x-0 top-0 flex justify-between items-center h-9 px-1",
//         button_previous:
//           "inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground",
//         button_next:
//           "inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground",
//         chevron: "size-4 fill-current",
//         month_grid: "w-full border-collapse space-y-1",
//         weekdays: "flex",
//         weekday:
//           "w-9 text-center font-mono text-[10px] font-medium uppercase tracking-[.18em] text-muted-foreground",
//         week: "flex w-full mt-1",
//         day: "relative p-0 text-center text-sm",
//         day_button:
//           "grid size-9 place-items-center rounded-lg text-sm font-medium text-foreground transition hover:bg-muted",
//         selected:
//           "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
//         today:
//           "text-primary font-bold after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
//         outside:
//           "text-muted-foreground/40 hover:bg-muted/50",
//         disabled: "text-muted-foreground/30 cursor-not-allowed",
//         hidden: "invisible",
//         ...classNames,
//       }}
//       {...props}
//     />
//   );
// }