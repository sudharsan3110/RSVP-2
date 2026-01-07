'use client';
import { useEffect, useState } from 'react';

export function usePersistentState<T>(key: string, initialValue: T, expiryMinutes?: number) {
  const [value, setValue] = useState<T>(
    getItemFromLocalStorage(key, expiryMinutes) || initialValue
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
    if (expiryMinutes) {
      localStorage.setItem(`${key}_expiry`, (Date.now() + expiryMinutes * 60 * 1000).toString());
    }
  }, [value]);

  return [value, setValue] as const;
}

function getItemFromLocalStorage<T>(key: string, expiryMinutes?: number): T | null {
  if (typeof window == 'undefined') return null;
  try {
    const value = localStorage.getItem(key);

    const expiry = expiryMinutes ? localStorage.getItem(`${key}_expiry`) : null;
    if (expiry && Date.now() > Number(expiry)) {
      clearLocalStorage(key);
      return null;
    }
    return value ? JSON.parse(value) : null;
  } catch (error) {
    throw new Error('Error parsing JSON from local storage');
  }

  return null;
}

export function clearLocalStorage(key: string) {
  localStorage.removeItem(key);
  localStorage.removeItem(`${key}_expiry`);
}
