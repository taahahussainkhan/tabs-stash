import { useEffect, useState } from 'react';

/**
 * Delay a rapidly changing value (search input) before it reaches a query key.
 * Keeps typing from firing one request per keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
