// Type definitions for lobbies and participants used throughout the
// frontend. Having a central file for these interfaces helps avoid
// circular imports and makes it easier to evolve the shape of lobby
// objects as the application grows.

/**
 * The tier of a lobby determines both the number of seats and the
 * stake per seat. These values are defined in the lobby creation
 * logic and used to calculate the total pool.
 */
export type Tier = 'Easy' | 'Medium' | 'Hot';

/**
 * A lobby can be in one of several states which drive the UI and
 * behaviour of the countdown and round resolution. When players
 * join, the lobby transitions from OPEN to FULL once the seats are
 * filled. A countdown then runs before marking the lobby as RUNNING
 * and eventually FINISHED with a winner. A CLOSED lobby is removed
 * from lists and cannot be joined.
 */
export type LobbyStatus = 'OPEN' | 'FULL' | 'RUNNING' | 'FINISHED' | 'CLOSED';

/**
 * Represents a single participant in a lobby. Avatars and wallet
 * addresses are optional because they may not be available at the
 * time of joining. The joinedAt timestamp is added on join.
 */
export interface Participant {
  id: string;
  nickname: string;
  avatarUrl?: string;
  wallet?: string;
  joinedAt: string;
}

/**
 * The core lobby type. Each lobby has a unique ID, a tier, a number
 * of seats and stake per seat, a status and the creator. The
 * participants array grows as users join. Optional fields such as
 * winnerId, countdownSec and poolTon are added or updated as the
 * lobby progresses through its lifecycle.
 */
export interface Lobby {
  id: string;
  tier: Tier;
  stakeTon: number;
  seats: number;
  status: LobbyStatus;
  createdAt: string;
  creatorId: string;
  participants: Participant[];
  /**
   * ID of the participant who won the round. Only populated when
   * status transitions to FINISHED.
   */
  winnerId?: string;
  /**
   * Countdown in seconds when a lobby becomes full. When the
   * countdown reaches zero the lobby enters RUNNING.
   */
  countdownSec?: number;
  /**
   * The total pool of TON locked in the lobby. It is calculated
   * as seats * stakeTon when the lobby is created and does not
   * change afterwards in the mock implementation.
   */
  poolTon?: number;
}