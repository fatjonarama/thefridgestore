"use client";

import { useEffect, useState } from "react";

/**
 * Keeps a component mounted long enough to play an exit transition before
 * unmounting, and defers the enter transition by one frame so the browser
 * has something to animate from.
 */
export function usePresence(open: boolean, duration = 250) {
  const [shouldRender, setShouldRender] = useState(open);
  const [entered, setEntered] = useState(false);
  const [syncedOpen, setSyncedOpen] = useState(open);

  if (open !== syncedOpen) {
    setSyncedOpen(open);
    if (open) setShouldRender(true);
  }

  useEffect(() => {
    if (!open) {
      // Nothing mounted yet (e.g. initial render with open=false) — no
      // exit transition to play, so don't schedule an unmount timer.
      if (!shouldRender) return;
      const timeout = setTimeout(() => {
        setShouldRender(false);
        setEntered(false);
      }, duration);
      return () => clearTimeout(timeout);
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open, duration, shouldRender]);

  return { shouldRender, visible: open && entered };
}
