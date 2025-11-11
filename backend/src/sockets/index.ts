import type { Server } from 'socket.io';
import { lobbyNs } from './lobby';
import { userNs } from './user';

export function attachSockets(io: Server) {
  lobbyNs(io.of('/lobbies'));
  userNs(io.of('/user'));
}

