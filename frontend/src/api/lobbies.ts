import { Lobby, Participant, Tier } from '../types/lobby';

/**
 * Simple in-memory store for mock lobbies. In a real application this
 * logic would live on the backend and these functions would perform
 * network requests. For now they enable local development of the
 * lobby mechanics without a running API.
 */

let mockLobbies: Lobby[] = [];

function generateLobbyId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function nowIso(): string {
  return new Date().toISOString();
}

function calcPool(seats: number, stakeTon: number): number {
  return Number((seats * stakeTon).toFixed(4));
}

export async function listLobbies(): Promise<Lobby[]> {
  return [...mockLobbies];
}

export async function getLobby(id: string): Promise<Lobby | undefined> {
  return mockLobbies.find((l) => l.id === id);
}

export async function createLobby(params: {
  tier: Tier;
  seats: number;
  stakeTon: number;
  creatorId: string;
  isPrivate?: boolean;
  password?: string;
}): Promise<Lobby> {
  const id = generateLobbyId();
  const lobby: Lobby = {
    id,
    tier: params.tier,
    seats: params.seats,
    stakeTon: params.stakeTon,
    status: 'OPEN',
    createdAt: nowIso(),
    creatorId: params.creatorId,
    participants: [],
    poolTon: calcPool(params.seats, params.stakeTon),
    isPrivate: !!(params.password && params.password.length > 0) || params.isPrivate,
    password: params.password,
  };
  mockLobbies.push(lobby);
  return lobby;
}

export async function joinLobby(lobbyId: string, participant: Participant, password?: string): Promise<Lobby | undefined> {
  const lobby = mockLobbies.find((l) => l.id === lobbyId);
  if (!lobby) return undefined;
  if (lobby.participants.some((p) => p.id === participant.id)) return lobby;
  if (lobby.status !== 'OPEN') return lobby;
  if (lobby.isPrivate) {
    if (!password || password !== lobby.password) {
      throw new Error('INVALID_PASSWORD');
    }
  }

  if (lobby.participants.length < lobby.seats) {
    lobby.participants.push({ ...participant, joinedAt: nowIso() });
    if (lobby.participants.length >= lobby.seats) {
      lobby.status = 'FULL';
      lobby.countdownSec = 10;
    }
  }
  return lobby;
}

export async function leaveLobby(lobbyId: string, userId: string): Promise<Lobby | undefined> {
  const lobby = mockLobbies.find((l) => l.id === lobbyId);
  if (!lobby) return undefined;
  const idx = lobby.participants.findIndex((p) => p.id === userId);
  if (idx >= 0) {
    lobby.participants.splice(idx, 1);
    if (lobby.status === 'FULL') {
      lobby.status = 'OPEN';
      delete lobby.countdownSec;
    }
    if (lobby.participants.length === 0) {
      lobby.status = 'CLOSED';
    }
  }
  return lobby;
}

export async function tickCountdown(lobbyId: string): Promise<Lobby | undefined> {
  const lobby = mockLobbies.find((l) => l.id === lobbyId);
  if (!lobby || lobby.countdownSec === undefined) return lobby;

  if (lobby.countdownSec > 0) {
    lobby.countdownSec -= 1;
    if (lobby.countdownSec === 0) {
      lobby.status = 'RUNNING';
      if (lobby.participants.length > 0) {
        const winner = lobby.participants[Math.floor(Math.random() * lobby.participants.length)];
        lobby.winnerId = winner.id;
      }
      setTimeout(() => {
        lobby.status = 'FINISHED';
        setTimeout(() => {
          lobby.status = 'CLOSED';
        }, 10000);
      }, 2000);
    }
  }
  return lobby;
}

export async function removeLobby(id: string) {
  const idx = mockLobbies.findIndex((l) => l.id === id);
  if (idx >= 0) mockLobbies.splice(idx, 1);
}
