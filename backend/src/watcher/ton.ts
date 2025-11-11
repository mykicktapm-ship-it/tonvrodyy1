import type { Server } from 'socket.io';
import { getSupabase, logEvent, upsertPayment } from '../services/supabase';

export function startTonWatcher(io: Server) {
  const base = process.env.TON_API_URL;
  const key = process.env.TON_API_KEY;
  if (!base) {
    console.log('⚠️ TON_API_URL not set — TON watcher disabled');
    return;
  }
  const intervalMs = 60_000; // 1m
  logEvent({ action: 'ton.watcher.start', message: 'watcher started', source: 'watcher/ton' });
  const tick = async () => {
    try {
      // Example endpoint; adjust to your provider (tonapi/toncenter)
      const url = `${base.replace(/\/$/, '')}/blockchain/getTransactions`;
      const r = await fetch(url, { headers: key ? { Authorization: `Bearer ${key}` } : undefined as any });
      if (!r.ok) return;
      const data = await r.json().catch(() => null);
      if (!data) return;
      const confirmationsRequired = Number(process.env.CONFIRMATIONS_REQUIRED || '3');
      const txs: any[] = Array.isArray((data as any)?.transactions) ? (data as any).transactions : [];
      const sb = getSupabase();
      for (const tx of txs) {
        try {
          const txHash = tx.hash || tx.transaction_id || null;
          const amount = Number(tx.amount || 0) / 1e9;
          const to = tx.to || tx.account_dst || null;
          const conf = Number(tx.confirmations || tx.confirmations_count || 0);
          if (!to || !txHash) continue;
          if (conf < confirmationsRequired) continue;
          if (!sb) continue;
          const { data: user } = await sb.from('users').select('id').eq('wallet_address', String(to)).maybeSingle();
          const userId = user?.id || null;
          await upsertPayment({ userId, type: 'deposit', amount, txHash, status: 'confirmed', confirmed: true });
          await logEvent({ action: 'tx.confirmed', userId, data: { txHash, amount }, source: 'watcher/ton' });
          io.of('/user').emit('payments:update', { userId, txHash, amount });
        } catch (e: any) {
          await logEvent({ level: 'error', action: 'ton.watcher.error', message: e?.message || String(e), source: 'watcher/ton' });
        }
      }
    } catch (e: any) {
      await logEvent({ level: 'error', action: 'ton.watcher.error', message: e?.message || String(e), source: 'watcher/ton' });
    }
  };
  setInterval(tick, intervalMs);
  console.log('🛰️ TON watcher started');
}
