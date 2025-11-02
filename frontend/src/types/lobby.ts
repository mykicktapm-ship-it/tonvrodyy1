export type Tier = 'Easy' | 'Medium' | 'Hot';

export type LobbyStatus = 'OPEN' | 'FULL' | 'RUNNING' | 'FINISHED' | 'CLOSED';

export interface Participant {
  id: string;
  name: string;
  wallet?: string;
  joinedAt?: string;
}

export interface Lobby {
  id: string;
  tier: Tier;
  seats: number;
  stakeTon: number;
  status: LobbyStatus;
  createdAt: string;
  creatorId: string;
  participants: Participant[];
  poolTon: number;
  countdownSec?: number;
  winnerId?: string;
  isPrivate?: boolean;
  // Demo-only: in-memory password for private lobbies
  password?: string;
}

