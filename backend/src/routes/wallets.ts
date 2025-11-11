import { Router } from 'express';
import { z } from 'zod';
import { getSupabase, logEvent } from '../services/supabase';

const router = Router();

const linkSchema = z.object({ appId: z.string().min(1), walletAddress: z.string().min(4) });
const activateSchema = z.object({ appId: z.string().min(1), walletAddress: z.string().min(4) });

router.post('/link', async (req, res) => {
  const parsed = linkSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { appId, walletAddress } = parsed.data;
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  const { data: u } = await sb.from('users').select('id').eq('app_id', appId).maybeSingle();
  if (!u) return res.status(404).json({ error: 'User not found' });
  await sb.from('wallet_history').insert([{ user_id: u.id, wallet_address: walletAddress, connected_at: new Date().toISOString() }]);
  await logEvent({ action:'wallet.link', userId: u.id, data:{ walletAddress }, requestId: (req as any).id, ip: (req as any).clientIp, ua: (req as any).userAgent, source: 'routes/wallets' });
  return res.json({ ok: true });
});

router.post('/activate', async (req, res) => {
  const parsed = activateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { appId, walletAddress } = parsed.data;
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  const { data: u } = await sb.from('users').select('id').eq('app_id', appId).maybeSingle();
  if (!u) return res.status(404).json({ error: 'User not found' });
  await sb.from('users').update({ wallet_address: walletAddress }).eq('id', u.id);
  await logEvent({ action:'wallet.activate', userId: u.id, data:{ walletAddress }, requestId: (req as any).id, ip: (req as any).clientIp, ua: (req as any).userAgent, source: 'routes/wallets' });
  return res.json({ ok: true });
});

router.get('/', async (req, res) => {
  const appId = String(req.query.appId || '');
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  const { data: u } = await sb.from('users').select('id,wallet_address').eq('app_id', appId).maybeSingle();
  if (!u) return res.json({ items: [] });
  const { data: hist } = await sb
    .from('wallet_history')
    .select('wallet_address,connected_at,disconnected_at')
    .eq('user_id', u.id)
    .order('connected_at', { ascending: false });
  return res.json({ active: u.wallet_address, items: hist || [] });
});

export default router;
