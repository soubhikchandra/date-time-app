"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface HistoryEntry {
  id: string;
  tool: string;
  toolName: string;
  signature: string; // stable key from inputs
  summary: string;
  details: Record<string, string>;
  timestamp: number;
}

interface HistoryContextValue {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  removeEntry: (id: string) => void;
  clear: () => void;
  /** True if an entry with the same tool+signature already exists. */
  hasSignature: (tool: string, signature: string) => boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
      const full: HistoryEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
      };
      // Skip if same tool + same signature already saved.
      setEntries((prev) => {
        const dup = prev.some(
          (e) => e.tool === full.tool && e.signature === full.signature
        );
        if (dup) return prev;
        return [full, ...prev].slice(0, 50);
      });
    },
    []
  );

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clear = useCallback(() => setEntries([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const hasSignature = useCallback(
    (tool: string, signature: string) =>
      entries.some((e) => e.tool === tool && e.signature === signature),
    [entries]
  );

  const value = useMemo(
    () => ({
      entries,
      addEntry,
      removeEntry,
      clear,
      hasSignature,
      isOpen,
      open,
      close,
    }),
    [entries, addEntry, removeEntry, clear, hasSignature, isOpen, open, close]
  );

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}