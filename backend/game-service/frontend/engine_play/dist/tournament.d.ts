import type { GameState } from './types.js';
import { Tracker } from './tracker.js';
import { Player } from './player.js';
import { CPU } from './CPU.js';
export interface contender {
    id: number | null;
    name: string;
}
export interface buildTournament {
    players: contender[];
}
export interface infoMatch {
    tracked: Tracker[];
}
export declare class Tournament {
    private canvasH;
    private canvasW;
    private finish;
    private matchs;
    private confs;
    private currentMatchId;
    private winner;
    launch: boolean;
    constructor(canvasW: number, canvasH: number, info: buildTournament);
    private startMatchs;
    private buildConfs;
    playLocal(): GameState;
    getNextMatch(): [string | null, string | null];
    redirectTournament(key: string, isPressed: boolean): void;
    appendWinner(winner: Player | CPU | string): void;
    isFinished(): boolean;
}
