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
