import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
export declare class Player {
    id: number;
    name: string;
    paddle: Paddle;
    keys: {
        up: string;
        down: string;
    };
    input: Record<string, boolean>;
    constructor(paddle: Paddle, keys: {
        up: string;
        down: string;
    }, name: string, id?: number);
    update(ball: Ball, canvasHeight: number): void;
}
