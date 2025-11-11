import type { Namespace, Socket } from 'socket.io';

export function lobbyNs(nsp: Namespace) {
  nsp.on('connection', (socket: Socket) => {
    const { lobbyId, userId } = socket.handshake.query as Record<string, string>;
    if (lobbyId) socket.join(`lobby:${lobbyId}`);
    socket.emit('connected', { ok: true, lobbyId });

    socket.on('join', (payload: { lobbyId: string; userId: string }) => {
      socket.join(`lobby:${payload.lobbyId}`);
      nsp.to(`lobby:${payload.lobbyId}`).emit('participant:join', { userId: payload.userId });
    });

    socket.on('leave', (payload: { lobbyId: string; userId: string }) => {
      socket.leave(`lobby:${payload.lobbyId}`);
      nsp.to(`lobby:${payload.lobbyId}`).emit('participant:leave', { userId: payload.userId });
    });

    socket.on('countdown', (payload: { lobbyId: string; seconds: number }) => {
      nsp.to(`lobby:${payload.lobbyId}`).emit('countdown:update', { seconds: payload.seconds });
    });

    socket.on('disconnect', () => {
      // no-op
    });
  });
}

