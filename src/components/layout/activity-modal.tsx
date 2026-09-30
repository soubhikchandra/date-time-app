"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Activity as ActivityIcon, X } from "lucide-react";

interface Activity {
  tool: string;
  toolName: string;
  summary: string;
  details: Record<string, string>;
  timestamp: string;
}

interface ActivityModalProps {
  isOpen: boolean;
  activities: Activity[];
  onClose: () => void;
}

const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function ActivityModal({
  isOpen,
  activities,
  onClose,
}: ActivityModalProps) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Activity"
        className="result-pop relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <ActivityIcon size={16} />
            </span>
            <div className="min-w-0">
              <strong className="block text-sm font-extrabold tracking-[-.03em]">
                Your activity
              </strong>
              <small className="block font-mono text-[9px] uppercase tracking-[.18em] text-muted-foreground">
                {activities.length}{" "}
                {activities.length === 1 ? "entry" : "entries"}
              </small>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/35 p-6 text-center text-sm leading-6 text-muted-foreground">
              No activity yet.
              <br />
              Save a calculation to see it here.
            </div>
          ) : (
            <ul className="space-y-3">
              {activities.map((a, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-border bg-background/60 p-4"
                >
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[.2em] text-primary">
                    {a.toolName}
                  </p>
                  <p className="ticker mt-1 font-mono text-xl font-medium tracking-[-.04em] text-foreground">
                    {a.summary}
                  </p>

                  {a.details && Object.keys(a.details).length > 0 && (
                    <dl className="mt-3 space-y-1.5 border-t border-border/70 pt-3 text-xs">
                      {Object.entries(a.details).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3">
                          <dt className="text-muted-foreground">{k}</dt>
                          <dd className="font-mono text-foreground">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                    {formatDateTime(a.timestamp)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}