import { Lobby, Participant, Tier, LobbyStatus } from '../types/lobby';

/**
 * Simple in-memory store for mock lobbies. In a real application this
 * logic would live on the backend and these functions would perform
 * network requests. For now they enable local development of the
 * lobby mechanics without a running API.
 */

// Internal mock storage. Each lobby lives here for the duration of a
// browser session. Because modules are cached, this persists across
// calls during development but resets on refresh.
let mockLobbies: Lobby[] = [];

// Helper to compute a random base36 string for lobby IDs. Ensures
// uniqueness for demonstration purposes.
function generateLobbyId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Generate a timestamp string in ISO format.
function nowIso(): string {
  return new Date().toISOString();
}

// Calculate the total pool from seats and stake. Included here to
// centralise logic; assigned in createLobby and patched when seats change.
function calcPool(seats: number, stakeTon: number): number {
  return Number((seats * stakeTon).toFixed(4));
}

/**
 * List all existing lobbies. In real scenario this would fetch from
 * `/api/lobbies`. For now returns a promise to mimic async behaviour.
 */
export async function listLobbies(): Promise<Lobby[]> {
  return [...mockLobbies];
}

/**
 * Retrieve a single lobby by id. Returns undefined if not found.
 */
export async function getLobby(id: string): Promise<Lobby | undefined> {
  return mockLobbies.find((l) => l.id === id);
}

/**
 * Create a new lobby. Generates a unique ID, sets status OPEN and
 * initial fields. The creator is not automatically joined—join
 * separately if desired.
 */
export async function createLobby(params: {
  tier: Tier;
  seats: number;
  stakeTon: number;
  creatorId: string;
  isPrivate?: boolean;
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
  };
  mockLobbies.push(lobby);
  return lobby;
}

/**
 * Join a lobby. If the lobby is full or the user already joined, no
 * changes occur. Returns the updated lobby or undefined if not found.
 */
export async function joinLobby(lobbyId: string, participant: Participant): Promise<Lobby | undefined> {
  const lobby = mockLobbies.find((l) => l.id === lobbyId);
  if (!lobby) return undefined;
  // Do not join if already a participant
  if (lobby.participants.some((p) => p.id === participant.id)) {
    return lobby;
  }
  // Only allow join while lobby is open
  if (lobby.status !== 'OPEN') {
    return lobby;
  }
  // Add participant if seats available
  if (lobby.participants.length < lobby.seats) {
    lobby.participants.push({ ...participant, joinedAt: nowIso() });
    // If lobby is now full, update status
    if (lobby.participants.length >= lobby.seats) {
      lobby.status = 'FULL';
      lobby.countdownSec = 10;
    }
  }
  return lobby;
}

/**
 * Leave a lobby. Removes participant by id. If lobby becomes empty,
 * it is closed. If lobby was full and a participant leaves, status
 * returns to OPEN and countdown is cleared.
 */
export async function leaveLobby(lobbyId: string, userId: string): Promise<Lobby | undefined> {
  const lobby = mockLobbies.find((l) => l.id === lobbyId);
  if (!lobby) return undefined;
  const idx = lobby.participants.findIndex((p) => p.id === userId);
  if (idx >= 0) {
    lobby.participants.splice(idx, 1);
    // Reset status if lobby was full but now has a free seat
    if (lobby.status === 'FULL') {
      lobby.status = 'OPEN';
      delete lobby.countdownSec;
    }
    // Close lobby if empty
    if (lobby.participants.length === 0) {
      lobby.status = 'CLOSED';
    }
  }
  return lobby;
}

/**
 * Progress a lobby countdown. Decrements countdownSec if present and
 * transitions to RUNNING when it reaches zero. Called repeatedly by
 * the store or UI setInterval to simulate backend-driven updates.
 */
export async function tickCountdown(lobbyId: string): Promise<Lobby | undefined> {
  const lobby = mockLobbies.find((l) => l.id === lobbyId);
  if (!lobby || lobby.countdownSec === undefined) return lobby;
  if (lobby.countdownSec > 0) {
    lobby.countdownSec -= 1;
    // When countdown hits zero, select a winner and update status
    if (lobby.countdownSec === 0) {
      lobby.status = 'RUNNING';
      // Determine winner — simple random selection among participants
      if (lobby.participants.length > 0) {
        const winner = lobby.participants[Math.floor(Math.random() * lobby.participants.length)];
        lobby.winnerId = winner.id;
      }
      // After short delay, mark as finished
      setTimeout(() => {
        lobby.status = 'FINISHED';
        // Auto-close lobby 10 seconds after finish
        setTimeout(() => {
          lobby.status = 'CLOSED';
        }, 10000);
      }, 2000);
    }
  }
  return lobby;
}

/**
 * Remove a lobby entirely. Used when status transitions to CLOSED and
 * should no longer appear in lists. In a real system, this would
 * persist deletion in the backend.
 */
export async function removeLobby(id: string) {
  const idx = mockLobbies.findIndex((l) => l.id === id);
  if (idx >= 0) mockLobbies.splice(idx, 1);
}