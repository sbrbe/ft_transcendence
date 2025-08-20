import { Ball } from "./ball.js";
import { Paddle } from "./paddle.js";
import { Tracker } from "./tracker.js";
export declare class Orchestrator {
    width: number;
    height: number;
    ball: Ball;
    paddles: Paddle[];
    tracker: Tracker;
    scores: {
        A: number;
        B: number;
    };
    running: boolean;
    private lastUpdateMs;
    constructor({ width, height }: {
        width: number;
        height: number;
    });
    applyInput(index: 0 | 1, dir: 'up' | 'down' | 'stop', dtMs: number): void;
    update(nowMs: number): void;
    getSnapshot(): {
        ball: {
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
        };
        paddles: {
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
        }[];
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
    };
}
