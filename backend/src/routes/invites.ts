import { Router } from 'express';
import { z } from 'zod';
import invitesLegacy from '../invites';

// This router proxies to existing invites logic to keep backward compatibility
const router = Router();

const createSchema = z.object({ lobbyId: z.string().min(1) });

router.post('/create', (req, res, next) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  return (invitesLegacy as any).handle(req, res, next); // let legacy router handle
});

export default router;

