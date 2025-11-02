import { Router, Request, Response } from 'express';

const router = Router();

// In-memory token store for demo
const tokens = new Map<string, { lobbyId: string; createdAt: number; expiresAt: number }>();

function genToken(len = 24) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

router.post('/create', (req: Request, res: Response) => {
  const { lobbyId } = req.body || {};
  if (!lobbyId || typeof lobbyId !== 'string') return res.status(400).json({ error: 'lobbyId required' });
  const token = genToken();
  const now = Date.now();
  tokens.set(token, { lobbyId, createdAt: now, expiresAt: now + 1000 * 60 * 60 });
  res.json({ token });
});

router.get('/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  const data = tokens.get(token);
  if (!data) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
  if (Date.now() > data.expiresAt) {
    tokens.delete(token);
    return res.status(410).json({ ok: false, error: 'EXPIRED' });
  }
  res.json({ ok: true, lobbyId: data.lobbyId });
});

export default router;

