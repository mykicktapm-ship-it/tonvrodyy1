import { create } from 'zustand';
import { Lobby, Participant, Tier } from '../types/lobby';
import { listLobbies, getLobby, createLobby as apiCreateLobby, joinLobby as apiJoinLobby, leaveLobby as apiLeaveLobby, tickCountdown, removeLobby } from '../api/lobbies';

/**
 * Zustand store for managing lobby state across the application.
 * Contains actions to fetch lobbies, create new ones, join/leave, and
 * handle countdown progression. In a real app these actions would
 * include network requests; here they work on a local in-memory
 * collection maintained by the api module.
 */

interface LobbiesState {
  items: Lobby[];
  current?: Lobby;
  loading: boolean;
  // Fetch all lobbies from the API/stub
  fetchAll: () => Promise<void>;
  // Fetch a specific lobby
  fetchOne: (id: string) => Promise<void>;
  // Create a new lobby
  create: (params: { tier: Tier; seats: number; stakeTon: number; creatorId: string; isPrivate?: boolean }) => Promise<void>;
  // Join an existing lobby
  join: (id: string, participant: Participant) => Promise<void>;
  // Leave a lobby
  leave: (id: string, userId: string) => Promise<void>;
  // Advance countdown — should be called periodically by UI timer
  tick: (id: string) => Promise<void>;
  // Remove lobby from store when closed
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
  async fetchOne(id) {
    set({ loading: true });
    const lobby = await getLobby(id);
    set({ current: lobby, loading: false });
  },
  async create(params) {
    const lobby = await apiCreateLobby(params);
    set((state) => ({ items: [...state.items, lobby] }));
  },
  async join(id, participant) {
    const lobby = await apiJoinLobby(id, participant);
    if (!lobby) return;
    set((state) => {
      const items = state.items.map((l) => (l.id === id ? lobby : l));
      const current = state.current?.id === id ? lobby : state.current;
      return { items, current };
    });
  },
  async leave(id, userId) {
    const lobby = await apiLeaveLobby(id, userId);
    if (!lobby) return;
    // If lobby is closed, remove it
    if (lobby.status === 'CLOSED') {
      await removeLobby(id);
      set((state) => ({ items: state.items.filter((l) => l.id !== id), current: state.current?.id === id ? undefined : state.current }));
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
    // If lobby status changed to CLOSED here, remove it
    if (lobby.status === 'CLOSED') {
      await removeLobby(id);
      set((state) => ({ items: state.items.filter((l) => l.id !== id), current: state.current?.id === id ? undefined : state.current }));
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
    set((state) => ({ items: state.items.filter((l) => l.id !== id), current: state.current?.id === id ? undefined : state.current }));
  },
}));