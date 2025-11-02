import { create } from 'zustand';
import { Lobby, Participant, Tier } from '../types/lobby';
import {
  listLobbies,
  getLobby,
  createLobby as apiCreateLobby,
  joinLobby as apiJoinLobby,
  leaveLobby as apiLeaveLobby,
  tickCountdown,
  removeLobby,
} from '../api/lobbies';

/**
 * Zustand store для управления состоянием лобби.
 * Хранит активные лобби, текущее выбранное и методы для управления ими.
 */

interface LobbiesState {
  items: Lobby[];
  current?: Lobby;
  loading: boolean;
  fetchAll: () => Promise<void>;
  fetchOne: (id: string) => Promise<void>;
  create: (params: { tier: Tier; seats: number; stakeTon: number; creatorId: string; isPrivate?: boolean; password?: string }) => Promise<void>;
  join: (id: string, participant: Participant, password?: string) => Promise<void>;
  leave: (id: string, userId: string) => Promise<void>;
  tick: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useLobbies = create<LobbiesState>((set, get) => ({
  items: [],
  current: undefined,
  loading: false,

  async fetchAll() {
    set({ loading: true });
    const data = await listLobbies();
    set({ items: data, loading: false });
  },

  async fetchOne(id: string) {
    set({ loading: true });
    const lobby = await getLobby(id);
    set({ current: lobby, loading: false });
  },

  async create(params) {
    const lobby = await apiCreateLobby(params);
    set((state) => ({ items: [...state.items, lobby] }));
  },

  async join(id, participant, password) {
    const lobby = await apiJoinLobby(id, participant, password);
    if (!lobby) return;
    try {
      const backend = (import.meta as any).env.VITE_BACKEND_URL || '';
      await fetch(`${String(backend).replace(/\/$/, '')}/api/activity`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appId: participant.id, action: 'join_lobby', extra_data: { lobbyId: id } })
      });
    } catch {}
    set((state) => {
      const items = state.items.map((l) => (l.id === id ? lobby : l));
      const current = state.current?.id === id ? lobby : state.current;
      return { items, current };
    });
  },

  async leave(id, userId) {
    const lobby = await apiLeaveLobby(id, userId);
    if (!lobby) return;
    try {
      const backend = (import.meta as any).env.VITE_BACKEND_URL || '';
      await fetch(`${String(backend).replace(/\/$/, '')}/api/activity`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appId: userId, action: 'leave_lobby', extra_data: { lobbyId: id } })
      });
    } catch {}

    if (lobby.status === 'CLOSED') {
      await removeLobby(id);
      set((state) => ({
        items: state.items.filter((l) => l.id !== id),
        current: state.current?.id === id ? undefined : state.current,
      }));
    } else {
      set((state) => {
        const items = state.items.map((l) => (l.id === id ? lobby : l));
        const current = state.current?.id === id ? lobby : state.current;
        return { items, current };
      });
    }
  },

  async tick(id) {
    const lobby = await tickCountdown(id);
    if (!lobby) return;

    if (lobby.status === 'CLOSED') {
      await removeLobby(id);
      set((state) => ({
        items: state.items.filter((l) => l.id !== id),
        current: state.current?.id === id ? undefined : state.current,
      }));
    } else {
      set((state) => {
        const items = state.items.map((l) => (l.id === id ? lobby : l));
        const current = state.current?.id === id ? lobby : state.current;
        return { items, current };
      });
    }
  },

  async remove(id) {
    await removeLobby(id);
    set((state) => ({
      items: state.items.filter((l) => l.id !== id),
      current: state.current?.id === id ? undefined : state.current,
    }));
  },
}));
