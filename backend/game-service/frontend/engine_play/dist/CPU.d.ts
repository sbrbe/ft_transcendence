import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
export declare class CPU {
    name: string;
    paddle: Paddle;
    gameMode: string;
    private limitTop;
    private limitBot;
    private lastDecisionTime;
    private YImpact;
    kk: {
        up: string;
        down: string;
    };
    input: Record<string, boolean>;
    constructor(paddle: Paddle, mode: string, indexPaddle: number, canvasHeight: number, keys: {
        up: string;
        down: string;
    });
    private simulateKey;
    predictBall(ball: Ball, canvasHeight: number): number;
    handleInput(speed: number): void;
    update(ball: Ball, canvasHeight: number): void;
}
