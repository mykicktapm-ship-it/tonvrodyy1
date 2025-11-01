import create from 'zustand';
import { nanoid } from 'nanoid';
import { Lobby, Participant, LobbyStatus, Tier } from '../types/lobby';

type LobbiesState = {
  lobbies: Lobby[];
  createLobby: (opts: {
    tier: Tier;
    stakeTon: number;
    seats: number;
    creatorId: string;
  }) => Lobby;
  joinLobby: (lobbyId: string, p: Omit<Participant, 'joinedAt'>) => Lobby | undefined;
  leaveLobby: (lobbyId: string, participantId: string) => void;
  startLobbyCountdown: (lobbyId: string, seconds: number) => void;
  pickWinner: (lobbyId: string) => void;
  closeLobby: (lobbyId: string) => void;
  reset: () => void;
};

const DEFAULT_LOBBIES: Lobby[] = [];

export const useLobbiesStore = create<LobbiesState>((set, get) => ({
  lobbies: DEFAULT_LOBBIES,
  createLobby: ({ tier, stakeTon, seats, creatorId }) => {
    const newLobby: Lobby = {
      id: nanoid(),
      tier,
      stakeTon,
      seats,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      creatorId,
      participants: [],
    };
    set((s) => ({ lobbies: [newLobby, ...s.lobbies] }));
    return newLobby;
  },
  joinLobby: (lobbyId, p) => {
    const lobbies = get().lobbies.map((l) => {
      if (l.id !== lobbyId) return l;
      if (l.status !== 'OPEN' && l.status !== 'FULL') return l;
      if (l.participants.find((x) => x.id === p.id)) return l;
      const participant: Participant = { ...p, joinedAt: new Date().toISOString() };
      const participants = [...l.participants, participant];
      const status: LobbyStatus = participants.length >= l.seats ? 'FULL' : 'OPEN';
      return { ...l, participants, status };
    });
    set({ lobbies });
    const lobby = lobbies.find((x) => x.id === lobbyId);
    // If lobby is FULL, optionally start countdown
    if (lobby && lobby.status === 'FULL') {
      // start a short countdown (mock)
      setTimeout(() => get().startLobbyCountdown(lobbyId, 8), 200);
    }
    return lobby;
  },
  leaveLobby: (lobbyId, participantId) => {
    set((s) => ({
      lobbies: s.lobbies.map((l) => {
        if (l.id !== lobbyId) return l;
        const participants = l.participants.filter((p) => p.id !== participantId);
        return { ...l, participants, status: participants.length < l.seats ? 'OPEN' : l.status };
      }),
    }));
  },
  startLobbyCountdown: (lobbyId, seconds) => {
    // set countdownSec & status RUNNING, tick down every sec
    set((s) => ({
      lobbies: s.lobbies.map((l) => (l.id === lobbyId ? { ...l, countdownSec: seconds, status: 'RUNNING' } : l)),
    }));
    const timer = setInterval(() => {
      const lobby = get().lobbies.find((l) => l.id === lobbyId);
      if (!lobby) {
        clearInterval(timer);
        return;
      }
      if ((lobby.countdownSec ?? 0) <= 1) {
        clearInterval(timer);
        // pick winner
        get().pickWinner(lobbyId);
        return;
      }
      set((s) => ({
        lobbies: s.lobbies.map((l) =>
          l.id === lobbyId ? { ...l, countdownSec: Math.max(0, (l.countdownSec ?? 0) - 1) } : l
        ),
      }));
    }, 1000);
  },
  pickWinner: (lobbyId) => {
    set((s) => {
      const l = s.lobbies.find((x) => x.id === lobbyId);
      if (!l) return { lobbies: s.lobbies };
      if (l.participants.length === 0) {
        // no participants -> close
        return {
          lobbies: s.lobbies.map((x) => (x.id === lobbyId ? { ...x, status: 'FINISHED', winnerId: undefined } : x)),
        };
      }
      const winner = l.participants[Math.floor(Math.random() * l.participants.length)];
      return {
        lobbies: s.lobbies.map((x) =>
          x.id === lobbyId ? { ...x, status: 'FINISHED', winnerId: winner.id, countdownSec: 0 } : x
        ),
      };
    });
  },
  closeLobby: (lobbyId) => {
    set((s) => ({ lobbies: s.lobbies.map((l) => (l.id === lobbyId ? { ...l, status: 'CLOSED' } : l)) }));
  },
  reset: () => set({ lobbies: DEFAULT_LOBBIES }),
}));
