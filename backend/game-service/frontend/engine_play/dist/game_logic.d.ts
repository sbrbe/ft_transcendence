import type { GameState } from './types.js';
import type { gameConfig } from './types.js';
export declare class GameLogic {
    private canvasW;
    private canvasH;
    private ball;
    private players;
    private paddles;
    private scoreA;
    private scoreB;
    private running;
    private tracker;
    private config;
    constructor(W: number, H: number, conf: gameConfig);
    private initPlayers;
    isEnd(): boolean;
    setPlayerInput(key: string, isPressed: boolean): void;
    update(): void;
    getStatus(): boolean;
    changeStatus(x: boolean): void;
    getGameState(): GameState;
    applyInput(playerIndex: number, dir: 'up' | 'down' | 'stop'): void;
    getSnapshot(): GameState;
}
