import { Router, Request, Response } from 'express';
import { getSupabase, createInvite as sbCreateInvite, getInvite as sbGetInvite, deleteExpiredInvites as sbDeleteExpired } from './services/supabase';

const router = Router();

// In-memory token store for demo
const tokens = new Map<string, { lobbyId: string; createdAt: number; expiresAt: number }>();

function genToken(len = 24) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

router.post('/create', async (req: Request, res: Response) => {
  const { lobbyId } = req.body || {};
  if (!lobbyId || typeof lobbyId !== 'string') return res.status(400).json({ error: 'lobbyId required' });
  const token = genToken();
  const now = Date.now();
  const expiresAt = new Date(now + 1000 * 60 * 60);
  if (getSupabase()) {
    await sbCreateInvite(token, lobbyId, expiresAt);
  } else {
    tokens.set(token, { lobbyId, createdAt: now, expiresAt: expiresAt.getTime() });
  }
  res.json({ token });
});

router.get('/:token', async (req: Request, res: Response) => {
  const { token } = req.params;
  if (getSupabase()) {
    const inv = await sbGetInvite(token);
    if (!inv) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    const expired = new Date(inv.expires_at).getTime() <= Date.now();
    if (expired) return res.status(410).json({ ok: false, error: 'EXPIRED' });
    return res.json({ ok: true, lobbyId: inv.lobby_id, expiresAt: inv.expires_at });
  } else {
    const data = tokens.get(token);
    if (!data) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    if (Date.now() > data.expiresAt) {
      tokens.delete(token);
      return res.status(410).json({ ok: false, error: 'EXPIRED' });
    }
    return res.json({ ok: true, lobbyId: data.lobbyId, expiresAt: new Date(data.expiresAt).toISOString() });
  }
});

export default router;



// Delete expired invites
router.delete('/expired', async (_req: Request, res: Response) => {
  if (getSupabase()) {
    await sbDeleteExpired();
    return res.json({ ok: true });
  }
  const now = Date.now();
  for (const [tok, v] of Array.from(tokens.entries())) {
    if (v.expiresAt <= now) tokens.delete(tok);
  }
  return res.json({ ok: true });
});

