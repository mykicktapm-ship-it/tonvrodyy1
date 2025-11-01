export type Tier = 'Easy' | 'Medium' | 'Hot';
export type LobbyStatus = 'OPEN' | 'FULL' | 'RUNNING' | 'FINISHED' | 'CLOSED';

export interface Participant {
  id: string;
  nickname: string;
  avatarUrl?: string;
  wallet?: string;
  joinedAt: string;
}

export interface Lobby {
  id: string;
  tier: Tier;
  stakeTon: number;
  seats: number;
  status: LobbyStatus;
  createdAt: string;
  creatorId: string;
  participants: Participant[];
  winnerId?: string;
  countdownSec?: number;
}