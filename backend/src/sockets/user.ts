import type { Namespace, Socket } from 'socket.io';

export function userNs(nsp: Namespace) {
  nsp.on('connection', (socket: Socket) => {
    const { userId } = socket.handshake.query as Record<string, string>;
    if (userId) socket.join(`user:${userId}`);
    socket.emit('connected', { ok: true, userId });

    socket.on('subscribe:payments', (payload: { userId: string }) => {
      socket.join(`user:${payload.userId}`);
    });
  });
}

