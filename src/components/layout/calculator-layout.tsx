import React from "react";

interface CalculatorLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function CalculatorLayout({ title, description, children }: CalculatorLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </header>
      {children}
    </div>
  );
}