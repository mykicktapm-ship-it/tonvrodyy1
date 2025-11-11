import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { initSupabase, deleteExpiredInvites } from './services/supabase';
import { initBot } from './bot';
import http from 'http';
import { Server } from 'socket.io';
import { attachSockets } from './sockets';
import { startTonWatcher } from './watcher/ton';

const PORT = Number(process.env.PORT) || 3000;

// Bot init (optional)
if (!process.env.TG_BOT_TOKEN) {
  console.log('⚠️ TG_BOT_TOKEN not set - Telegram bot is disabled');
} else {
  console.log('🤖 Bot initialized');
  initBot(process.env.TG_BOT_TOKEN, app);
}

const sb = initSupabase();
console.log(sb ? '✅ Supabase env detected' : '⚠️ Supabase env missing or incomplete (SUPABASE_URL / SUPABASE_ANON_KEY)');

// HTTP + Socket.IO
const server = http.createServer(app);

const allowed = (process.env.WS_ALLOWED_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const io = new Server(server, {
  path: '/ws',
  cors: { origin: allowed, methods: ['GET','POST'] },
});

attachSockets(io);

server.listen(PORT, () => {
  console.log(`✅ Backend запущен на http://localhost:${PORT}`);
});

server.on('error', (err: any) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`❌ Порт ${PORT} уже занят (EADDRINUSE)`);
  } else {
    console.error('❌ Server error:', err);
  }
});

// Periodic GC for expired invites (every 10 minutes)
setInterval(() => {
  console.log('[Invite GC]', 'Expired invites cleanup triggered');
  deleteExpiredInvites();
}, 10 * 60 * 1000);

// TON watcher (polls TON API and emits socket events)
startTonWatcher(io);

