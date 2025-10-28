/**
 * WebSocket helper for lobby updates. In the current demo environment
 * there is no real backend broadcasting events, so this module
 * implements a no-op subscription. When a backend is available,
 * replace the implementation to connect to a real WebSocket server.
 */

// Define the shape of lobby events if needed in the future
export type LobbyEvent =
  | { type: 'lobby.updated'; lobbyId: string }
  | { type: 'lobby.full'; lobbyId: string; countdownSec: number }
  | { type: 'lobby.winner'; lobbyId: string; winnerId: string }
  | { type: 'lobby.closed'; lobbyId: string };

/**
 * Connect to the lobby WebSocket. Accepts a callback to receive
 * incoming events. Returns a cleanup function to close the
 * connection. In this stub, we immediately return a no-op cleanup.
 */
export function connectLobbyWS(onEvent: (e: LobbyEvent) => void): () => void {
  // TODO: implement real WebSocket connection when backend supports it
  return () => {
    // no-op
  };
}