"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "signup";
  onClose: () => void;
  onSuccess: (user: { email: string; name?: string }) => void;
}

const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function AuthModal({
  isOpen,
  initialMode = "login",
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError(null);
  };

  const switchMode = (next: "login" | "signup") => {
    reset();
    setMode(next);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const payload =
      mode === "login" ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setBusy(false);
        return;
      }
      setBusy(false);
      reset();
      onSuccess(data.user);
    } catch {
      setBusy(false);
      setError("Network error. Please try again.");
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label={mode === "login" ? "Login" : "Create account"}
        className="result-pop relative z-10 flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[.22em] text-primary">
              {mode === "login" ? "Welcome back" : "Get started"}
            </p>
            <h2 className="mt-1 text-lg font-extrabold tracking-[-.03em] text-foreground">
              {mode === "login" ? "Login" : "Create account"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {mode === "login"
                ? "Access your saved calculations."
                : "Save your work across devices."}
            </p>
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
        <form onSubmit={submit} className="space-y-4 px-5 py-5">
          {mode === "signup" && (
            <Input
              label="Name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <p className="text-sm font-semibold text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={busy} className="w-full min-h-11">
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Login"
                : "Create account"}
          </Button>
        </form>

        {/* Toggle footer */}
        <div className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="font-bold text-primary hover:underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-bold text-primary hover:underline"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}