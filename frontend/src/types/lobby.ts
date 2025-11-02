export type Tier = 'Easy' | 'Medium' | 'Hot';

export type LobbyStatus = 'OPEN' | 'FULL' | 'RUNNING' | 'FINISHED' | 'CLOSED';

export interface Participant {
  id: string;
  name: string;
  wallet?: string;
  joinedAt?: string; // время присоединения к лобби
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
  countdownSec?: number; // таймер перед стартом
  winnerId?: string; // победитель лобби
  isPrivate?: boolean; // приватное лобби
}