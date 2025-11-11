import { Router } from 'express';
import { getSupabase } from '../services/supabase';

const router = Router();

router.get('/recent', async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.json({ items: [] });
  const limitRaw = Number(req.query.limit ?? 200);
  const limit = Math.max(10, Math.min(1000, isNaN(limitRaw) ? 200 : limitRaw));
  const action = req.query.action as string | undefined;
  const userId = req.query.userId as string | undefined;
  let q = sb.from('app_log')
    .select('ts, level, source, action, message, data, user_id, lobby_id, request_id')
    .order('ts', { ascending: false })
    .limit(limit);
  if (action) q = q.eq('action', action);
  if (userId) q = q.eq('user_id', userId);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ items: data || [] });
});

export default router;

