export interface Lap {
  index: number;
  /** Total elapsed when this lap was recorded (ms). */
  totalMs: number;
  /** Time of just this lap segment (ms). */
  lapMs: number;
}

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

function pad(n: number, size = 2): string {
  return String(Math.floor(n)).padStart(size, "0");
}

/**
 * Format milliseconds as "HH:MM:SS.CS".
 * Centiseconds = hundredths of a second (00–99).
 */
export function formatStopwatch(ms: number): string {
  const safe = Math.max(0, ms);
  const totalCs = Math.floor(safe / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const h = Math.floor(totalMin / 60);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
}

/** Short, human-readable version: "1m 23s" or "1h 2m". */
export function shortFormat(ms: number): string {
  const totalSec = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

/* ------------------------------------------------------------------ */
/*  Lap analysis                                                       */
/* ------------------------------------------------------------------ */

export interface LapStats {
  fastestIndex: number | null;
  slowestIndex: number | null;
  fastestMs: number | null;
  slowestMs: number | null;
}

export function analyzeLaps(laps: Lap[]): LapStats {
  if (laps.length < 2) {
    return {
      fastestIndex: null,
      slowestIndex: null,
      fastestMs: null,
      slowestMs: null,
    };
  }
  let fast = laps[0];
  let slow = laps[0];
  for (const lap of laps) {
    if (lap.lapMs < fast.lapMs) fast = lap;
    if (lap.lapMs > slow.lapMs) slow = lap;
  }
  return {
    fastestIndex: fast.index,
    slowestIndex: slow.index,
    fastestMs: fast.lapMs,
    slowestMs: slow.lapMs,
  };
}