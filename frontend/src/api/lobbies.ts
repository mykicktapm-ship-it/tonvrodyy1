import { Lobby, Participant, Tier } from '../types/lobby';

const backend = (import.meta as any).env.VITE_BACKEND_URL || '';
const api = (path: string) => `${String(backend).replace(/\/$/, '')}${path}`;

export async function listLobbies(): Promise<Lobby[]> {
  const r = await fetch(api('/api/lobbies/public'));
  if (!r.ok) throw new Error(`listLobbies failed: ${r.status}`);
  const data = await r.json();
  return data as Lobby[];
}

export async function getLobby(id: string): Promise<Lobby | undefined> {
  const r = await fetch(api(`/api/lobbies/${id}`));
  if (!r.ok) return undefined;
  return (await r.json()) as Lobby;
}

export async function createLobby(params: {
  tier: Tier;
  seats: number;
  stakeTon: number;
  creatorId: string;
  isPrivate?: boolean;
  password?: string;
}): Promise<Lobby> {
  const r = await fetch(api('/api/lobbies/create'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId: params.creatorId, seats: params.seats, stakeTon: params.stakeTon, isPrivate: params.isPrivate, password: params.password })
  });
  if (!r.ok) throw new Error(`createLobby failed: ${r.status}`);
  return (await r.json()) as Lobby;
}

export async function joinLobby(lobbyId: string, participant: Participant, password?: string): Promise<Lobby | undefined> {
  const r = await fetch(api(`/api/lobbies/${lobbyId}/join`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId: participant.id, password })
  });
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    const err = body?.error || `joinLobby failed: ${r.status}`;
    throw new Error(err);
  }
  return (await r.json()) as Lobby;
}

export async function leaveLobby(lobbyId: string, userId: string): Promise<Lobby | undefined> {
  const r = await fetch(api(`/api/lobbies/${lobbyId}/leave`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId: userId })
  });
  if (!r.ok) return undefined;
  return (await r.json()) as Lobby;
}

export async function tickCountdown(_lobbyId: string): Promise<Lobby | undefined> {
  // Countdown/round progression is server-side in a real app; noop here.
  return undefined;
}

export async function removeLobby(_id: string) {
  // Removing is managed by server retention policies; noop here.
}
