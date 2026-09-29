"use client";

import { useEffect, useState } from "react";
import { Check, Clock3, Copy, Trash2, X } from "lucide-react";
import { useHistory, type HistoryEntry } from "./history-context";
import { cn } from "@/lib/utils";

function formatDateTime(ts: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(ts));
}

function buildExportText(entries: HistoryEntry[]) {
  const lines: string[] = [];
  lines.push("Date & Time Toolkit — History");
  lines.push(`Exported: ${formatDateTime(Date.now())}`);
  lines.push(`Entries: ${entries.length}`);
  lines.push("");

  entries.forEach((entry, i) => {
    lines.push(`${i + 1}. ${entry.toolName} — ${entry.summary}`);
    Object.entries(entry.details).forEach(([k, v]) => {
      lines.push(`   ${k}: ${v}`);
    });
    lines.push(`   Saved: ${formatDateTime(entry.timestamp)}`);
    lines.push("");
  });

  return lines.join("\n").trim();
}

export function HistoryPopup() {
  const { entries, isOpen, close, removeEntry, clear } = useHistory();
  const [copied, setCopied] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(buildExportText(entries));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={close}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-label="History"
        className="result-pop relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Clock3 size={16} />
            </span>
            <div className="min-w-0">
              <strong className="block text-sm font-extrabold tracking-[-.03em]">
                History
              </strong>
              <small className="block font-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">
                {entries.length} {entries.length === 1 ? "entry" : "entries"} · this session
              </small>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={copyAll}
              disabled={entries.length === 0}
              aria-label="Copy all history"
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition",
                "text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              )}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="hidden sm:inline">
                {copied ? "Copied" : "Copy all"}
              </span>
            </button>

            <button
              type="button"
              onClick={close}
              aria-label="Close history"
              className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/35 p-6 text-center text-sm leading-6 text-muted-foreground">
              No saved results yet.
              <br />
              Run a calculator and tap{" "}
              <strong className="text-foreground">Save to history</strong>.
            </div>
          ) : (
            <ul className="space-y-3">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-border bg-background/60 p-4"
                >
                  {/* Top row: tool name + timestamp + delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-medium uppercase tracking-[.2em] text-primary">
                        {entry.toolName}
                      </p>
                      <p className="ticker mt-1 font-mono text-2xl font-medium tracking-[-.04em] text-foreground">
                        {entry.summary}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      aria-label="Remove entry"
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Details */}
                  <dl className="mt-3 space-y-1.5 border-t border-border/70 pt-3 text-xs">
                    {Object.entries(entry.details).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="font-mono text-foreground">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  {/* Date + time footer */}
                  <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
                    <span className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                      Saved
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {formatDateTime(entry.timestamp)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div className="border-t border-border px-5 py-3">
            <button
              type="button"
              onClick={clear}
              className="w-full rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}