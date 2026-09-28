import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

// A wrapper for "JSON.parse()"" to support "undefined" value
function parseJSON<T>(value: string | null): T | undefined {
  try {
    return value === 'undefined' ? undefined : JSON.parse(value ?? '');
  } catch (error) {
    return undefined;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): { storedValue: T; setValue: SetValue<T>; removeValue: () => void } {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const storedValueRef = useRef<T>(storedValue);
  const initialValueRef = useRef<T>(initialValue);

  useEffect(() => {
    storedValueRef.current = storedValue;
  }, [storedValue]);

  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: SetValue<T> = useCallback(
    (value) => {
      // Prevent build error "window is undefined" but keeps working
      if (typeof window === 'undefined') {
        console.warn(`Tried setting localStorage key “${key}” even though environment is not a client`);
      }

      try {
        const currentValue = storedValueRef.current;
        // Allow value to be a function so we have the same API as useState
        const newValue = value instanceof Function ? value(currentValue) : value;

        // Só grava e dispara evento se o valor realmente mudou
        if (JSON.stringify(newValue) === JSON.stringify(currentValue)) {
          return;
        }

        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        }

        // Save state and update ref
        storedValueRef.current = newValue;
        setStoredValue(newValue);

        // We dispatch a custom event so every useLocalStorage hook are notified
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('local-storage'));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key]
  );

  // Function to remove value from local storage and update state
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const currentValue = storedValueRef.current;
      const targetValue = initialValueRef.current;

      const itemInStorage = window.localStorage.getItem(key);
      if (itemInStorage === null && JSON.stringify(currentValue) === JSON.stringify(targetValue)) {
        return;
      }

      window.localStorage.removeItem(key);
      storedValueRef.current = targetValue;
      setStoredValue(targetValue); // Update state to initial value
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error removing localStorage key “${key}”:`, error);
    }
  }, [key]);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      const parsed = item ? parseJSON<T>(item) ?? initialValue : initialValue;
      storedValueRef.current = parsed;
      setStoredValue(parsed);
    } catch (error) {
      storedValueRef.current = initialValue;
      setStoredValue(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { storedValue, setValue, removeValue };
}
