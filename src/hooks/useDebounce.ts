import { useEffect, useState } from "react";

const useDebounce = <T>(value: T, delayMs = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    // Cleanup cancels the pending timer when value changes or component unmounts
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
};

export default useDebounce;
