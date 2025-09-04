import { Paddle } from "./paddle";
import { Tracker } from "./tracker";
export declare class Ball {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    serviceTo: string;
    vx: number;
    vy: number;
    speed: number;
    limitspeed: number;
    live: boolean;
    constructor(x: number, y: number, width: number, height: number, color: string, serviceTo: string);
    spawn(): void;
    stop(): void;
    launch(angle: number): void;
    colisionMultiple(paddles: Paddle[], canvasHeight: number, tracker: Tracker): void;
    colision(paddle: Paddle, canvasHeight: number, tracker: Tracker): void;
    goal(canvasWidth: number): boolean;
    update(): void;
}
