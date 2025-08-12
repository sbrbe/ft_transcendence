// src/gameTypes.ts

export type PlayerType = "human" | "cpu" | null;

export type gameMode = "1v1" | "2v2" | "CPU" | "tournament";

export interface PlayerInfo {
  type: PlayerType;
  playerId: number; // ← évite null, plus simple côté logique
}

export interface gameConfig {
  mode: gameMode;
  // Autorise: ["human","cpu",...] OU [{type:"human",playerId:1},...]
  playerSetup?: PlayerType[] | PlayerInfo[];
}

export interface GameState {
  ball: {
    x: number; y: number; width: number; height: number; color: string;
  };
  paddles: ({
    x: number; y: number; width: number; height: number; color: string;
  } | null)[];
  scores: { A: number; B: number };
  running: boolean;
  traker: {
    winner: string | null;
    totalExchanges: number;
    maxRally: number;
  };
}

// === Input utilisateur (pour local/online) ===
export interface PlayerInput {
  playerId: number;                 // ← aligne avec PlayerInfo (number)
  direction: 'up' | 'down' | 'stop';
}

// === Message WebSocket entrant/sortant ===
export interface ServerMessage {
  type: 'gameState' | 'matchFound' | 'info' | 'error';
  payload: any;
}
