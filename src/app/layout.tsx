// //src/app/layout.tsx
// import type { Metadata } from "next";
// import Script from "next/script";
// import "./globals.css";
// import { AppShell } from "@/components/layout/app-shell";

// export const metadata: Metadata = {
//   title: "Date & Time Toolkit",
//   description: "11 date and time calculators in one place.",
// };

// const themeScript = `
// try {
//   var t = localStorage.getItem('dtt-theme');
//   if (t === 'dark') document.documentElement.classList.add('dark');
// } catch (e) {}
// `;

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <Script id="theme-init" strategy="beforeInteractive">
//           {themeScript}
//         </Script>
//       </head>
//       <body className="app-shell min-h-screen text-foreground">
//         <AppShell>{children}</AppShell>
//       </body>
//     </html>
//   );
// }


// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Date & Time Toolkit",
  description: "11 date and time calculators in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="app-shell min-h-screen text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}