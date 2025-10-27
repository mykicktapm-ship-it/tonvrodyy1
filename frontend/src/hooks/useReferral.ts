import { useEffect, useState } from 'react';

/**
 * Captures referrer ID from URL query parameters on the first page load and
 * stores it in localStorage. Subsequent calls return the stored value.
 */
export function useReferral(): string | null {
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    let stored = localStorage.getItem('referrerId');
    if (!stored) {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        localStorage.setItem('referrerId', ref);
        stored = ref;
      }
    }
    if (stored) {
      setReferrer(stored);
    }
  }, []);

  return referrer;
}