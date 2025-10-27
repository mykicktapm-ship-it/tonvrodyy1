import { useEffect, useState } from 'react';

/**
 * Hook to derive a unique application user ID from Telegram init data.
 * If Telegram user ID is available, generate SHA-256 hash of user ID + app salt.
 * Otherwise, fall back to a random nanoid and persist in localStorage.
 */
export function useAppUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function generateId() {
      // Check localStorage first
      const stored = localStorage.getItem('app_user_id');
      if (stored) {
        setUserId(stored);
        return;
      }
      // Get Telegram user id if available
      let telegramId: string | undefined;
      try {
        const tg = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
        if (tg && tg.id) {
          telegramId = String(tg.id);
        }
      } catch (err) {
        // ignore
      }
      const salt = import.meta.env.VITE_APP_SALT || 'default_salt';
      let result: string;
      if (telegramId) {
        // Create SHA-256 hash of telegramId + salt
        const data = new TextEncoder().encode(telegramId + salt);
        const digest = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(digest));
        result = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } else {
        // Fallback: generate pseudo-random string
        const random = crypto.getRandomValues(new Uint8Array(16));
        result = Array.from(random)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      }
      localStorage.setItem('app_user_id', result);
      setUserId(result);
    }
    generateId();
  }, []);
  return userId;
}