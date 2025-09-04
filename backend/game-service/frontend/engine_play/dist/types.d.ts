import { Player } from "./player";
import { CPU } from "./CPU";
type gameMode = "1v1" | "2v2" | "CPU" | "tournament";
export interface PlayerInfo {
    type: "human" | "cpu" | null;
    playerId: number | null;
    name: string;
}
export interface gameConfig {
    mode: gameMode;
    playerSetup: PlayerInfo[];
}
export interface GameState {
    ball: {
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
    };
    paddles: ({
        name: string;
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
    } | null)[];
    scores: {
        A: number;
        B: number;
    };
    running: boolean;
    tracker: {
        winner: Player | CPU | null;
        totalExchanges: number;
        maxRally: number;
    };
}
export interface PlayerInput {
    playerId: string;
    direction: 'up' | 'down' | 'stop';
}
export interface ServerMessage {
    type: 'gameState' | 'matchFound' | 'info' | 'error';
    payload: any;
}
export interface Snapshot {
    ball: {
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
    };
    paddles: ({
        x: number;
        y: number;
        width: number;
        height: number;
        color: string;
    } | null)[];
    scores: {
        A: number;
        B: number;
    };
    running: boolean;
    tracker: {
        winner: string | null;
        totalExchanges: number;
        maxRally: number;
    };
}
export {};
