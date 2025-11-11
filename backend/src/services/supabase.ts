import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function initSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  supabase = createClient(url, anon);
  return supabase;
}

export function getSupabase(): SupabaseClient | null {
  return supabase;
}

// Data shape for invites table
export interface Invite {
  token: string;
  lobby_id: string;
  created_at: string; // ISO timestamp
  expires_at: string; // ISO timestamp
}

// Create invite row; logs errors and returns
export async function createInvite(token: string, lobbyId: string, expiresAt: Date): Promise<void> {
  try {
    if (!supabase) return;
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from('invites')
      .insert([{ token, lobby_id: lobbyId, created_at: nowIso, expires_at: expiresAt.toISOString() }]);
    if (error) {
      console.error('Supabase createInvite error:', error.message);
    } else {
      console.log('[Supabase] invite created', { token, lobbyId, expiresAt: expiresAt.toISOString() });
    }
  } catch (e: any) {
    console.error('Supabase createInvite exception:', e?.message || e);
  }
}

// Fetch invite by token; returns null on error or not found
export async function getInvite(token: string): Promise<Invite | null> {
  try {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('invites')
      .select('token,lobby_id,created_at,expires_at')
      .eq('token', token)
      .maybeSingle();
    if (error) {
      console.error('Supabase getInvite error:', error.message);
      return null;
    }
    if (data) {
      console.log('[Supabase] invite read', { token });
    }
    return (data as Invite) || null;
  } catch (e: any) {
    console.error('Supabase getInvite exception:', e?.message || e);
    return null;
  }
}

// Delete expired invites; logs errors
export async function deleteExpiredInvites(): Promise<void> {
  try {
    if (!supabase) return;
    const now = new Date().toISOString();
    const { error, count } = await supabase.from('invites').delete({ count: 'estimated' }).lte('expires_at', now);
    if (error) {
      console.error('Supabase deleteExpiredInvites error:', error.message);
    } else {
      console.log('[Supabase] expired invites cleanup ok', { count });
    }
  } catch (e: any) {
    console.error('Supabase deleteExpiredInvites exception:', e?.message || e);
  }
}

// -------------------- Logging and helpers --------------------

export type LogParams = {
  level?: 'debug'|'info'|'warn'|'error'|'fatal';
  action: string;
  message?: string;
  data?: Record<string, any> | null;
  userId?: string | null;
  lobbyId?: string | null;
  requestId?: string | null;
  source?: string;
  ip?: string | null;
  ua?: string | null;
};

export async function logEvent(params: LogParams): Promise<void> {
  try {
    if (!supabase) return;
    const payload: any = {
      ts: new Date().toISOString(),
      level: params.level || 'info',
      action: params.action,
      message: params.message || null,
      data: params.data ?? null,
      user_id: params.userId ?? null,
      lobby_id: params.lobbyId ?? null,
      request_id: params.requestId ?? null,
      source: params.source || null,
      ip: params.ip ?? null,
      ua: params.ua ?? null,
    };
    const { error } = await supabase.from('app_log').insert([payload]);
    if (error) console.error('logEvent error:', error.message);
  } catch (e: any) {
    console.error('logEvent exception:', e?.message || e);
  }
}

export async function recordUserActivity(userId: string, action: string, extra?: any): Promise<void> {
  try {
    if (!supabase) return;
    await supabase.from('user_activity').insert([{ user_id: userId, action, extra_data: extra ?? null }]);
  } catch (e: any) {
    console.error('recordUserActivity error:', e?.message || e);
  }
}

export async function dedupWebhook(updateId: number, payload: any): Promise<boolean> {
  try {
    if (!supabase) return true; // allow pass-through when supabase off
    if (!updateId) return true;
    const { data, error } = await supabase
      .from('webhook_events')
      .upsert({ update_id: updateId, payload, created_at: new Date().toISOString() }, { onConflict: 'update_id', ignoreDuplicates: true })
      .select('update_id');
    if (error) {
      console.error('dedupWebhook error:', error.message);
      return false;
    }
    return !!(data && data.length > 0);
  } catch (e: any) {
    console.error('dedupWebhook exception:', e?.message || e);
    return false;
  }
}

export type UpsertPaymentArgs = {
  userId: string | null;
  type: 'deposit'|'withdraw';
  amount: number;
  txHash?: string | null;
  status?: 'pending'|'confirmed'|'failed';
  confirmed?: boolean;
};

export async function upsertPayment(args: UpsertPaymentArgs): Promise<void> {
  try {
    if (!supabase) return;
    const status = args.confirmed ? 'confirmed' : (args.status || 'pending');
    const row: any = {
      user_id: args.userId,
      type: args.type,
      amount: args.amount,
      status,
      tx_hash: args.txHash || null,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('payments')
      .upsert(row, { onConflict: 'tx_hash', ignoreDuplicates: false });
    if (error) console.error('upsertPayment error:', error.message);
  } catch (e: any) {
    console.error('upsertPayment exception:', e?.message || e);
  }
}
