import { Ball } from "./ball";
export declare class Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    speed: number;
    constructor(x: number, y: number, width: number, height: number, color: string, speed?: number);
    moove(dir: number): void;
    interaction(ball: Ball): void;
}
