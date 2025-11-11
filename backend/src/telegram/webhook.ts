import { Router, Request, Response } from 'express';
import { getSupabase, dedupWebhook, logEvent, recordUserActivity } from '../services/supabase';

const router = Router();

// Telegram webhook: verify secret header, dedup by update_id, and upsert user
router.post('/', async (req: Request, res: Response) => {
  const secret = process.env.TG_BOT_API_SECRET;
  const header = req.header('X-Telegram-Bot-Api-Secret-Token');
  if (secret && header !== secret) {
    await logEvent({ level: 'warn', action: 'tg.webhook.rejected', message: 'secret mismatch', source: 'telegram/webhook', requestId: (req as any).id, ip: (req as any).clientIp, ua: (req as any).userAgent, data: null });
    return res.status(403).json({ ok: false });
  }
  const update = req.body;
  try {
    const updateId = Number(update?.update_id ?? update?.updateId ?? 0);
    const unique = await dedupWebhook(updateId, update);
    if (!unique) return res.json({ ok: true });

    const sb = getSupabase();
    if (sb) {
      const from = update?.message?.from || update?.callback_query?.from || null;
      if (from?.id) {
        const appId = String(from.id);
        const { data: existing } = await sb
          .from('users')
          .select('id')
          .eq('telegram_id', String(from.id))
          .maybeSingle();
        if (!existing) {
          await sb.from('users').insert([{ telegram_id: String(from.id), app_id: appId }]);
        }
        const userId = (existing?.id as string) || null;
        await logEvent({ action: 'tg.webhook.accepted', userId, data: { updateId }, requestId: (req as any).id, ip: (req as any).clientIp, ua: (req as any).userAgent, source: 'telegram/webhook' });
        if (userId) await recordUserActivity(userId, 'tg:webhook', { updateId });
      }
    }
  } catch (e: any) {
    console.error('Webhook upsert error:', e?.message || e);
  }
  return res.json({ ok: true });
});

export default router;

