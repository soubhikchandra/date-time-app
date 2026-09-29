// import React from "react";

// interface CalculatorLayoutProps {
//   title: string;
//   description?: string;
//   children: React.ReactNode;
// }

// export function CalculatorLayout({ children }: CalculatorLayoutProps) {
//   return (
//     <div className="mx-auto max-w-[1120px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-12">
//       {/* Hero header */}
//       <header className="mb-9">
//         <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[.22em] text-primary">
//           <span className="size-1.5 rounded-full bg-accent" />
//           The answer is closer than you think
//         </p>

//         <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.02] tracking-[-.065em] text-foreground sm:text-5xl">
//           Make time <span className="text-primary">make sense.</span>
//         </h1>

//         <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
//           A focused collection of date and time tools for the little
//           calculations that deserve a clear answer.
//         </p>
//       </header>

//       {children}
//     </div>
//   );
// }

import React from "react";

interface CalculatorLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function CalculatorLayout({ children }: CalculatorLayoutProps) {
  return (
    <div className="mx-auto max-w-[1120px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-12">
      <header className="mb-9">
        <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[.22em] text-primary">
          <span className="size-1.5 rounded-full bg-accent" />
          The answer is closer than you think
        </p>

        <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.02] tracking-[-.065em] text-foreground sm:text-5xl">
          Make time <span className="text-primary">make sense.</span>
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          A focused collection of date and time tools for the little
          calculations that deserve a clear answer.
        </p>
      </header>

      {children}
    </div>
  );
}