"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; kind: "success" | "error"; message: string };

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: Toast["kind"], message: string) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    success: (message) => push("success", message),
    error: (message) => push("error", message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`glass pointer-events-auto flex items-center gap-2 border-l-4 px-4 py-3 text-sm shadow-lg transition-all ${
              t.kind === "success" ? "border-l-fridge-orange" : "border-l-ice-500"
            }`}
          >
            <span className={t.kind === "success" ? "text-fridge-orange" : "text-ice-500"}>
              {t.kind === "success" ? "✓" : "✕"}
            </span>
            <span className="text-ice-100">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-2 text-muted hover:text-ice-100"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
