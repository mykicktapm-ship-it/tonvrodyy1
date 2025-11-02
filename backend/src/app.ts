import express, { Request, Response } from "express";
import cors from "cors";
import crypto from "crypto";
import referralRouter from "./referral";
import invitesRouter from "./invites";
import { getSupabase } from "./services/supabase";

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.send("Backend works 🚀");
});

// Health check route
app.get("/api/status", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Backend running",
    timestamp: new Date().toISOString(),
  });
});

// Feature routes
app.use("/api/referrals", referralRouter);
app.use("/api/invites", invitesRouter);

// Diagnostics
app.get("/api/tg/status", (_req: Request, res: Response) => {
  res.json({ enabled: !!process.env.TG_BOT_TOKEN });
});
app.get("/api/supabase/status", (_req: Request, res: Response) => {
  res.json({ url: process.env.SUPABASE_URL || null, anon: !!process.env.SUPABASE_ANON_KEY });
});

// Helpers
async function ensureUser(appId: string, telegramId?: string) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: existing, error: selErr } = await sb
    .from('users')
    .select('id, app_id, telegram_id, wallet_address')
    .eq('app_id', appId)
    .maybeSingle();
  if (selErr) {
    console.error('ensureUser select error:', selErr.message);
    return null;
  }
  if (existing) return existing as any;
  const { data: inserted, error: insErr } = await sb
    .from('users')
    .insert([{ app_id: appId, telegram_id: telegramId || null }])
    .select('id, app_id, telegram_id, wallet_address')
    .maybeSingle();
  if (insErr) {
    console.error('ensureUser insert error:', insErr.message);
    return null;
  }
  return inserted as any;
}

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function mapLobbyStatus(db: string): 'OPEN'|'RUNNING'|'FINISHED' {
  switch (db) {
    case 'waiting': return 'OPEN';
    case 'active': return 'RUNNING';
    case 'finished':
    default: return 'FINISHED';
  }
}

// Users: upsert and wallet lifecycle
app.post('/api/users/upsert', async (req: Request, res: Response) => {
  const { appId, telegramId, walletAddress, action } = req.body || {};
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  if (!appId) return res.status(400).json({ error: 'appId required' });
  const user = await ensureUser(appId, telegramId);
  if (!user) return res.status(500).json({ error: 'Failed to upsert user' });
  if (action === 'connect' && walletAddress) {
    await sb.from('users').update({ wallet_address: walletAddress }).eq('id', user.id);
    await sb.from('wallet_history').insert([{ user_id: user.id, wallet_address: walletAddress, connected_at: new Date().toISOString() }]);
  } else if (action === 'disconnect') {
    await sb.from('users').update({ wallet_address: null }).eq('id', user.id);
    const { data: lastHist } = await sb
      .from('wallet_history')
      .select('id')
      .eq('user_id', user.id)
      .is('disconnected_at', null)
      .order('connected_at', { ascending: false })
      .limit(1);
    if (lastHist && lastHist[0]) {
      await sb.from('wallet_history').update({ disconnected_at: new Date().toISOString() }).eq('id', lastHist[0].id);
    }
  }
  return res.json({ ok: true });
});

// Users: aggregated stats
app.get('/api/users/:appId/stats', async (req: Request, res: Response) => {
  const { appId } = req.params;
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  const user = await ensureUser(appId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { data: parts, error: partsErr } = await sb
    .from('round_bets')
    .select('round_id')
    .eq('user_id', user.id);
  const totalRounds = partsErr ? 0 : new Set((parts || []).map((r: any) => r.round_id)).size;
  const { count: winsCount } = await sb
    .from('rounds')
    .select('*', { count: 'exact', head: true })
    .eq('winner_id', user.id);
  const wins = winsCount || 0;
  const winRate = totalRounds > 0 ? Number(((wins / totalRounds) * 100).toFixed(1)) : 0;
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: pays, error: payErr } = await sb
    .from('payments')
    .select('type, amount, status, created_at')
    .eq('user_id', user.id)
    .eq('status', 'confirmed');
  let winnings = 0;
  let last24h = 0;
  if (!payErr && pays) {
    for (const p of pays) {
      const amt = Number(p.amount || 0);
      const delta = p.type === 'withdraw' ? amt : -amt;
      winnings += delta;
      if (p.created_at >= since24h) last24h += delta;
    }
  }
  return res.json({ totalRounds, winRate, winnings: Number(winnings.toFixed(4)), last24h: Number(last24h.toFixed(4)) });
});

// Activity log
app.post('/api/activity', async (req: Request, res: Response) => {
  const { appId, action, extra_data } = req.body || {};
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  if (!appId || !action) return res.status(400).json({ error: 'appId and action required' });
  const user = await ensureUser(appId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await sb.from('user_activity').insert([{ user_id: user.id, action, extra_data: extra_data || null }]);
  return res.json({ ok: true });
});

// Lobbies endpoints (persisted)
app.get('/api/lobbies/public', async (_req: Request, res: Response) => {
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  const { data: lobbies, error } = await sb
    .from('lobbies')
    .select('id, created_by, is_private, status, created_at, seats, stake_ton, pool_ton');
  if (error) return res.status(500).json({ error: error.message });
  const { data: parts } = await sb
    .from('lobby_participants')
    .select('lobby_id, user_id, joined_at, left_at');
  const participants = parts || [];
  const items = (lobbies || []).filter((l: any) => !l.is_private).map((l: any) => {
    const ps = participants.filter((p: any) => p.lobby_id === l.id && !p.left_at);
    return {
      id: l.id,
      tier: 'Easy',
      seats: l.seats,
      stakeTon: Number(l.stake_ton || 0),
      status: mapLobbyStatus(l.status),
      createdAt: l.created_at,
      creatorId: l.created_by || '',
      participants: ps.map((p: any) => ({ id: p.user_id, name: p.user_id, joinedAt: p.joined_at })),
      poolTon: Number(l.pool_ton || 0),
      isPrivate: !!l.is_private,
    };
  });
  return res.json(items);
});

app.get('/api/lobbies/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  const { data: l, error } = await sb
    .from('lobbies')
    .select('id, created_by, is_private, status, created_at, seats, stake_ton, pool_ton')
    .eq('id', id)
    .maybeSingle();
  if (error || !l) return res.status(404).json({ error: 'Not found' });
  const { data: ps } = await sb
    .from('lobby_participants')
    .select('user_id, joined_at, left_at')
    .eq('lobby_id', id)
    .is('left_at', null);
  const resp = {
    id: l.id,
    tier: 'Easy',
    seats: l.seats,
    stakeTon: Number(l.stake_ton || 0),
    status: mapLobbyStatus(l.status),
    createdAt: l.created_at,
    creatorId: l.created_by || '',
    participants: (ps || []).map((p: any) => ({ id: p.user_id, name: p.user_id, joinedAt: p.joined_at })),
    poolTon: Number(l.pool_ton || 0),
    isPrivate: !!l.is_private,
  };
  return res.json(resp);
});

app.post('/api/lobbies/create', async (req: Request, res: Response) => {
  const { appId, seats, stakeTon, isPrivate, password } = req.body || {};
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  if (!appId || !seats || stakeTon === undefined) return res.status(400).json({ error: 'appId, seats, stakeTon required' });
  const user = await ensureUser(appId);
  if (!user) return res.status(400).json({ error: 'Invalid user' });
  const password_hash = password ? sha256(String(password)) : null;
  const { data, error } = await sb
    .from('lobbies')
    .insert([{ created_by: user.id, is_private: !!isPrivate, password_hash, status: 'waiting', seats, stake_ton: stakeTon, pool_ton: Number(seats) * Number(stakeTon) }])
    .select('id, created_by, is_private, status, created_at, seats, stake_ton, pool_ton')
    .maybeSingle();
  if (error || !data) return res.status(500).json({ error: error?.message || 'Create failed' });
  await sb.from('lobby_participants').insert([{ lobby_id: data.id, user_id: user.id, joined_at: new Date().toISOString() }]);
  return res.json({
    id: data.id,
    tier: 'Easy',
    seats: data.seats,
    stakeTon: Number(data.stake_ton || 0),
    status: mapLobbyStatus(data.status),
    createdAt: data.created_at,
    creatorId: data.created_by || '',
    participants: [{ id: user.id, name: user.id, joinedAt: new Date().toISOString() }],
    poolTon: Number(data.pool_ton || 0),
    isPrivate: !!data.is_private,
  });
});

app.post('/api/lobbies/:id/join', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { appId, password } = req.body || {};
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  if (!appId) return res.status(400).json({ error: 'appId required' });
  const user = await ensureUser(appId);
  if (!user) return res.status(400).json({ error: 'Invalid user' });
  const { data: lobby } = await sb
    .from('lobbies')
    .select('id, is_private, password_hash, status, seats, stake_ton, created_at, created_by, pool_ton')
    .eq('id', id)
    .maybeSingle();
  if (!lobby) return res.status(404).json({ error: 'Lobby not found' });
  if (lobby.is_private) {
    if (!password || sha256(String(password)) !== lobby.password_hash) {
      return res.status(403).json({ error: 'INVALID_PASSWORD' });
    }
  }
  if (lobby.status !== 'waiting') return res.status(400).json({ error: 'LOBBY_NOT_OPEN' });
  const { data: current } = await sb
    .from('lobby_participants')
    .select('id')
    .eq('lobby_id', id)
    .is('left_at', null);
  if ((current || []).length >= (lobby.seats || 0)) return res.status(409).json({ error: 'LOBBY_FULL' });
  const { data: already } = await sb
    .from('lobby_participants')
    .select('id, left_at')
    .eq('lobby_id', id)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(1);
  if (already && already[0] && !already[0].left_at) {
    // already joined
  } else {
    await sb.from('lobby_participants').insert([{ lobby_id: id, user_id: user.id, joined_at: new Date().toISOString() }]);
  }
  const { data: ps } = await sb
    .from('lobby_participants')
    .select('user_id, joined_at')
    .eq('lobby_id', id)
    .is('left_at', null);
  return res.json({
    id: lobby.id,
    tier: 'Easy',
    seats: lobby.seats,
    stakeTon: Number(lobby.stake_ton || 0),
    status: mapLobbyStatus(lobby.status),
    createdAt: lobby.created_at,
    creatorId: lobby.created_by || '',
    participants: (ps || []).map((p: any) => ({ id: p.user_id, name: p.user_id, joinedAt: p.joined_at })),
    poolTon: Number(lobby.pool_ton || 0),
    isPrivate: !!lobby.is_private,
  });
});

app.post('/api/lobbies/:id/leave', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { appId } = req.body || {};
  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: 'Supabase not configured' });
  if (!appId) return res.status(400).json({ error: 'appId required' });
  const user = await ensureUser(appId);
  if (!user) return res.status(400).json({ error: 'Invalid user' });
  await sb
    .from('lobby_participants')
    .update({ left_at: new Date().toISOString() })
    .eq('lobby_id', id)
    .eq('user_id', user.id)
    .is('left_at', null);
  const { data: lobby } = await sb
    .from('lobbies')
    .select('id, is_private, status, seats, stake_ton, created_at, created_by, pool_ton')
    .eq('id', id)
    .maybeSingle();
  if (!lobby) return res.status(404).json({ error: 'Lobby not found' });
  const { data: ps } = await sb
    .from('lobby_participants')
    .select('user_id, joined_at')
    .eq('lobby_id', id)
    .is('left_at', null);
  return res.json({
    id: lobby.id,
    tier: 'Easy',
    seats: lobby.seats,
    stakeTon: Number(lobby.stake_ton || 0),
    status: mapLobbyStatus(lobby.status),
    createdAt: lobby.created_at,
    creatorId: lobby.created_by || '',
    participants: (ps || []).map((p: any) => ({ id: p.user_id, name: p.user_id, joinedAt: p.joined_at })),
    poolTon: Number(lobby.pool_ton || 0),
    isPrivate: !!lobby.is_private,
  });
});

// Fallback route
app.use("*", (_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;

