import { Router } from 'express';
import { z } from 'zod';
import { getSupabase, logEvent } from '../services/supabase';

const router = Router();

const upsertSchema = z.object({
  appId: z.string().min(1),
  telegramId: z.string().optional(),
  walletAddress: z.string().optional(),
  action: z.enum(['connect','disconnect']).optional(),
});

router.post('/upsert', async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { appId, telegramId, walletAddress, action } = parsed.data;
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  const { data: existing } = await sb.from('users').select('id').eq('app_id', appId).maybeSingle();
  let userId: string | null = existing?.id || null;
  if (!userId) {
    const ins = await sb.from('users').insert([{ app_id: appId, telegram_id: telegramId || null }]).select('id').maybeSingle();
    userId = ins.data?.id || null;
  }
  if (!userId) return res.status(500).json({ error: 'Upsert failed' });
  if (action === 'connect' && walletAddress) {
    await sb.from('users').update({ wallet_address: walletAddress }).eq('id', userId);
    await sb.from('wallet_history').insert([{ user_id: userId, wallet_address: walletAddress, connected_at: new Date().toISOString() }]);
  } else if (action === 'disconnect') {
    await sb.from('users').update({ wallet_address: null }).eq('id', userId);
  }
  await logEvent({ action:'user.upsert', userId, data:{ action, walletAddress }, requestId: (req as any).id, ip: (req as any).clientIp, ua: (req as any).userAgent, source: 'routes/users' });
  return res.json({ ok: true });
});

// Get user by appId
router.get('/:appId', async (req, res) => {
  const { appId } = req.params;
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  const { data } = await sb.from('users').select('app_id,telegram_id,wallet_address,created_at').eq('app_id', appId).maybeSingle();
  if (!data) return res.status(404).json({ error: 'Not found' });
  return res.json(data);
});

// User history (payments summary + activities)
router.get('/:appId/history', async (req, res) => {
  const { appId } = req.params;
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  const { data: u } = await sb.from('users').select('id').eq('app_id', appId).maybeSingle();
  if (!u) return res.json({ payments: [], activity: [] });
  const { data: payments } = await sb
    .from('payments')
    .select('type,amount,status,tx_hash,created_at')
    .eq('user_id', u.id)
    .order('created_at', { ascending: false })
    .limit(100);
  const { data: activity } = await sb
    .from('user_activity')
    .select('action,timestamp,extra_data')
    .eq('user_id', u.id)
    .order('timestamp', { ascending: false })
    .limit(200);
  return res.json({ payments: payments || [], activity: activity || [] });
});

export default router;
