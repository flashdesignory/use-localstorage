import { useState, useCallback } from 'react';

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T , (value: T) => void ] => {
  if (!key) {
    throw new Error('A valid key should be provided to useLocalStorage.');
  }

  const readValue = () => {
    /* istanbul ignore if */
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      window.localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage from "${key}": `, error);
      return initialValue;
    }
  }

  const [storedValue, setStoredValue] = useState<T>(readValue());

  const setValue = useCallback((value: T) => {
    /* istanbul ignore next */
    if (typeof window === 'undefined') {
      console.warn(`Tried setting localStorage value for key "${key}"`)
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setStoredValue(value);
    } catch (error) {
      console.warn(`Error writing localStorage to "${key}": `, error);
    }
  }, [key, setStoredValue]);

  return [storedValue, setValue];
}
