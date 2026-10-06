//src/lib/utils.ts

/** Tiny classname joiner — replaces clsx, no dependency. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

