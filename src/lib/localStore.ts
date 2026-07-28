export function createLocalStore<T>(key: string, fallback: T) {
  let value: T = fallback;
  let hydrated = false;
  const listeners = new Set<() => void>();

  function hydrate() {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        value = JSON.parse(raw) as T;
      } catch {
        // ignore malformed storage
      }
    }
  }

  return {
    getSnapshot() {
      hydrate();
      return value;
    },
    getServerSnapshot() {
      return fallback;
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setValue(updater: T | ((prev: T) => T)) {
      hydrate();
      value =
        typeof updater === "function"
          ? (updater as (prev: T) => T)(value)
          : updater;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
      listeners.forEach((listener) => listener());
    },
  };
}
