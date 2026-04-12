import { useEffect, useState } from "react";

/**
 * Returns a debounced version of the value that only updates
 * after the specified delay (default 300ms).
 * Use this to avoid firing expensive operations on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * Returns a timestamp formatted as "X minutes/hours/days ago"
 * or a full date string for older entries
 */
export function useTimeAgo(timestamp: Date | null): string {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!timestamp) {
      setText("");
      return;
    }

    const update = () => {
      const diff = Date.now() - timestamp.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) setText("just now");
      else if (minutes < 60) setText(`${minutes}m ago`);
      else if (hours < 24) setText(`${hours}h ago`);
      else if (days < 7) setText(`${days}d ago`);
      else {
        setText(
          timestamp.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        );
      }
    };

    update();
    // Refresh every minute for live feel
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return text;
}
