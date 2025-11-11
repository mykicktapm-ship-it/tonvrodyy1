# tonvrodyy1

## Автоматическая очистка инвайтов
Каждые 10 минут backend вызывает deleteExpiredInvites() для удаления просроченных записей из Supabase (если Supabase доступен).

## Backend инфраструктура
- HTTP API: `/api/*` (лобби, пользователи, кошельки, инвайты)
- Health/metrics: `GET /health`, `GET /metrics`
- WebSockets: Socket.IO на пути `/ws`
  - namespace `/lobbies` — события участников/таймеров
  - namespace `/user` — платежи, личные события
- Telegram webhook: `POST /tg/webhook` с проверкой `X-Telegram-Bot-Api-Secret-Token`
- TON watcher: периодический опрос `TON_API_URL` с ключом `TON_API_KEY` (если заданы), эмитит события в `/user`

## Важные переменные окружения
- Backend:
  - `PORT`
  - `TG_BOT_TOKEN`
  - `TG_BOT_API_SECRET`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - `DATABASE_URL` (или `SUPABASE_DB_URL`) для SQL миграций
  - `TON_API_URL`, `TON_API_KEY`
  - `TELEGRAM_BOT_USERNAME`
  - `WS_ALLOWED_ORIGINS` (список origin через запятую)
- Frontend:
  - `VITE_BACKEND_URL`
  - `VITE_TONCONNECT_MANIFEST`
  - `VITE_TELEGRAM_BOT_USERNAME`

## Маршруты API (основные)
- Лобби: `GET /api/lobbies`, `POST /api/lobbies/create`, `POST /api/lobbies/:id/join`
- Пользователи: `GET /api/users/:appId`, `GET /api/users/:appId/history`, `POST /api/users/upsert`
- Кошельки: `POST /api/wallets/link`, `POST /api/wallets/activate`, `GET /api/wallets?appId=...`
- Инвайты: `POST /api/invites/create`, `GET /api/invites/:token`, `DELETE /api/invites/expired`



**Важные переменные окружения**
- Backend:
  - PORT
  - TG_BOT_TOKEN
  - TG_BOT_API_SECRET
  - SUPABASE_URL, SUPABASE_ANON_KEY
  - DATABASE_URL (или SUPABASE_DB_URL) для SQL миграций
  - TON_API_URL, TON_API_KEY
  - TELEGRAM_BOT_USERNAME
  - WS_ALLOWED_ORIGINS (список origin через запятую)
  - CONFIRMATIONS_REQUIRED (подтверждений для TON watcher, по умолчанию 3)
- Frontend:
  - VITE_BACKEND_URL
  - VITE_TONCONNECT_MANIFEST
  - VITE_TELEGRAM_BOT_USERNAME

