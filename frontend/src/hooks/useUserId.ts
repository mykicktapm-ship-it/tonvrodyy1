import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

/**
 * Generates or retrieves a unique user identifier and persists it in localStorage.
 * Returns the id as soon as it is available.
 */
export function useUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = nanoid();
      localStorage.setItem('userId', id);
    }
    setUserId(id);
  }, []);

  return userId;
}