//what is utils file means?

/** Tiny classname joiner — replaces clsx, no dependency. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

// what are this code means for? purpose with example: