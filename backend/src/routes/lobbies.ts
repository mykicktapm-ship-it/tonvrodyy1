import { Router } from 'express';
import { z } from 'zod';
import { getSupabase, logEvent, recordUserActivity } from '../services/supabase';
import crypto from 'crypto';

const router = Router();

const createSchema = z.object({
  appId: z.string().min(1),
  seats: z.number().int().min(2).max(100),
  stakeTon: z.number().nonnegative(),
  isPrivate: z.boolean().optional(),
  password: z.string().optional(),
});

const joinSchema = z.object({ appId: z.string().min(1), password: z.string().optional() });

function sha256(s: string) { return crypto.createHash('sha256').update(s).digest('hex'); }
function mapStatus(db: string): 'OPEN'|'RUNNING'|'FINISHED' {
  return db === 'waiting' ? 'OPEN' : db === 'active' ? 'RUNNING' : 'FINISHED';
}

router.get('/', async (_req, res) => {
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  const { data: lobbies, error } = await sb
    .from('lobbies')
    .select('id, created_by, is_private, status, created_at, seats, stake_ton, pool_ton');
  if (error) return res.status(500).json({ error: error.message });
  const { data: parts } = await sb.from('lobby_participants').select('lobby_id, user_id, joined_at, left_at');
  const participants = parts || [];
  const items = (lobbies || [])
    .filter((l: any) => !l.is_private)
    .map((l: any) => ({
      id: l.id,
      tier: 'Easy',
      seats: l.seats,
      stakeTon: Number(l.stake_ton || 0),
      status: mapStatus(l.status),
      createdAt: l.created_at,
      creatorId: l.created_by || '',
      participants: participants.filter((p: any) => p.lobby_id === l.id && !p.left_at).map((p: any) => ({ id: p.user_id, name: p.user_id, joinedAt: p.joined_at })),
      poolTon: Number(l.pool_ton || 0),
      isPrivate: !!l.is_private,
    }));
  return res.json(items);
});

router.post('/create', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { appId, seats, stakeTon, isPrivate, password } = parsed.data;
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  const { data: u } = await sb.from('users').select('id').eq('app_id', appId).maybeSingle();
  if (!u) return res.status(404).json({ error: 'User not found' });
  const { data, error } = await sb
    .from('lobbies')
    .insert([{ created_by: u.id, is_private: !!isPrivate, password_hash: password ? sha256(password) : null, status: 'waiting', seats, stake_ton: stakeTon, pool_ton: seats * stakeTon }])
    .select('id, created_by, is_private, status, created_at, seats, stake_ton, pool_ton')
    .maybeSingle();
  if (error || !data) return res.status(500).json({ error: error?.message || 'Create failed' });
  await sb.from('lobby_participants').insert([{ lobby_id: data.id, user_id: u.id }]);
  await logEvent({ action:'lobby.create', userId: u.id, lobbyId: data.id, data:{ seats, stakeTon, isPrivate: !!isPrivate }, requestId: (req as any).id, ip: (req as any).clientIp, ua: (req as any).userAgent, source: 'routes/lobbies' });
  await recordUserActivity(u.id, 'lobby:create', { lobbyId: data.id });
  return res.json({ id: data.id });
});

router.post('/:id/join', async (req, res) => {
  const parsed = joinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { appId, password } = parsed.data;
  const { id } = req.params;
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  const { data: u } = await sb.from('users').select('id').eq('app_id', appId).maybeSingle();
  if (!u) return res.status(404).json({ error: 'User not found' });
  const { data: lobby } = await sb.from('lobbies').select('id,is_private,password_hash,status,seats').eq('id', id).maybeSingle();
  if (!lobby) return res.status(404).json({ error: 'Lobby not found' });
  if (lobby.is_private && (!password || sha256(password) !== lobby.password_hash)) return res.status(403).json({ error: 'INVALID_PASSWORD' });
  const { data: cur } = await sb.from('lobby_participants').select('id').eq('lobby_id', id).is('left_at', null);
  if ((cur || []).length >= (lobby.seats || 0)) return res.status(409).json({ error: 'LOBBY_FULL' });
  await sb.from('lobby_participants').insert([{ lobby_id: id, user_id: u.id }]);
  await logEvent({ action:'lobby.join', userId: u.id, lobbyId: id, requestId: (req as any).id, ip: (req as any).clientIp, ua: (req as any).userAgent, source: 'routes/lobbies' });
  await recordUserActivity(u.id, 'lobby:join', { lobbyId: id });
  return res.json({ ok: true });
});

export default router;
