import { useEffect } from 'react';

function loadSocketIoScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).io) return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('socket.io script load failed'));
    document.head.appendChild(s);
  });
}

export function useUserSocket(userId: string | null | undefined, onPaymentsUpdate?: (payload: any) => void) {
  useEffect(() => {
    let socket: any;
    let cancelled = false;
    (async () => {
      try {
        if (!userId) return;
        await loadSocketIoScript();
        if (cancelled) return;
        const io = (window as any).io as any;
        if (typeof io !== 'function') return;
        // choose backend URL
        const base = (import.meta as any).env.VITE_BACKEND_URL || window.location.origin;
        socket = io(base, { path: '/ws', transports: ['websocket'], query: { userId }, forceNew: true, reconnection: true, reconnectionAttempts: 5 });
        const ns = socket.connect ? socket.connect('/user') : socket.of ? socket.of('/user') : socket; // fallback
        const target = ns || socket;
        target.on && target.on('payments:update', (payload: any) => {
          onPaymentsUpdate && onPaymentsUpdate(payload);
        });
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
      try { socket && socket.disconnect && socket.disconnect(); } catch {}
    };
  }, [userId, onPaymentsUpdate]);
}

