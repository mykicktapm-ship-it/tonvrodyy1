// Definitions for lobby entities and statuses used in the Laboratory feature.

export type Tier = 'Easy' | 'Medium' | 'Hot';

// Possible lifecycle statuses of a lobby.
export type LobbyStatus =
  | 'OPEN'      // lobby is accepting participants
  | 'FULL'      // all seats filled, countdown to start
  | 'RUNNING'   // a winner is being determined
  | 'FINISHED'  // the round has concluded and a winner is known
  | 'CLOSED';   // lobby is no longer available

// A participant in a lobby. Fields may be extended in future when
// integrating with Supabase or other backend services.
export interface Participant {
  id: string;           // app-specific user id (sha256 of telegram id + salt)
  nickname: string;     // user-provided name or fallback
  avatarUrl?: string;   // optional avatar URL from Telegram
  wallet?: string;      // TON wallet address if connected
  joinedAt: string;     // ISO timestamp when the participant joined
}

// Representation of a lobby. Additional metadata (e.g. private flag) can
// be added later. Calculated fields like `poolTon` are derived from
// existing properties.
export interface Lobby {
  id: string;
  tier: Tier;
  seats: number;
  stakeTon: number;
  status: LobbyStatus;
  createdAt: string;
  creatorId: string;
  participants: Participant[];
  // optional fields used during lobby lifecycle
  poolTon?: number;
  countdownSec?: number;
  winnerId?: string;
}