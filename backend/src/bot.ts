import type { Express } from 'express';
import { Telegraf } from 'telegraf';

export function initBot(token?: string, app?: Express | null) {
  if (!token) return null;
  const bot = new Telegraf(token);
  bot.start((ctx) => ctx.reply('Welcome to TONRODY backend bot ✨'));
  bot.command('ping', (ctx) => ctx.reply('pong'));
  bot.on('text', (ctx) => ctx.reply('👍 Received'));

  const webhookUrl = process.env.TG_BOT_WEBHOOK_URL;
  const hookPath = process.env.TG_BOT_WEBHOOK_PATH || '/tg/webhook';

  if (webhookUrl && app) {
    app.use(hookPath, bot.webhookCallback(hookPath));
    bot.telegram.setWebhook(`${webhookUrl}${hookPath}`)
      .then(() => console.log(`🤖 Bot webhook set at ${webhookUrl}${hookPath}`))
      .catch((e) => console.error('Failed to set webhook', e));
  } else {
    // Polling mode
    bot.launch().then(() => console.log('🤖 Bot launched (polling)'));
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }
  return bot;
}
