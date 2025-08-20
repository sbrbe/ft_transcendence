import { Ball } from "./ball.js";
import { Paddle } from "./paddle.js";
import { Tracker } from "./tracker.js";
export class Orchestrator {
    constructor({ width, height }) {
        this.scores = { A: 0, B: 0 };
        this.running = true;
        this.lastUpdateMs = 0;
        this.width = width;
        this.height = height;
        const padW = 12, padH = 100, padSpeed = 450;
        this.paddles = [
            new Paddle(20, (height - padH) / 2, padW, padH, "#fff", padSpeed), // left
            new Paddle(width - 20 - padW, (height - padH) / 2, padW, padH, "#fff", padSpeed), // right
        ];
        this.tracker = new Tracker();
        this.ball = new Ball(width / 2 - 8, height / 2 - 8, 16, 16, "#fff", "right");
        this.ball.spawn();
    }
    applyInput(index, dir, dtMs) {
        const p = this.paddles[index];
        const dist = p.speed * (dtMs / 1000);
        if (dir === 'up')
            p.move(-dist);
        if (dir === 'down')
            p.move(+dist);
        if (p.y < 0)
            p.y = 0;
        if (p.y + p.height > this.height)
            p.y = this.height - p.height;
    }
    update(nowMs) {
        if (!this.running)
            return;
        if (!this.lastUpdateMs)
            this.lastUpdateMs = nowMs;
        const dtMs = nowMs - this.lastUpdateMs;
        this.lastUpdateMs = nowMs;
        this.ball.collisionMultiple(this.paddles, this.height, this.tracker, dtMs);
        this.ball.update(dtMs);
        if (this.ball.goal(this.width)) {
            const winner = (this.ball.serviceTo === 'left') ? 'B' : 'A';
            if (winner === 'A')
                this.scores.A++;
            else
                this.scores.B++;
            this.tracker.setWinner(winner);
            // remise en jeu
            this.tracker.resetExchange();
            this.ball.x = this.width / 2 - this.ball.width / 2;
            this.ball.y = this.height / 2 - this.ball.height / 2;
            this.ball.spawn();
        }
    }
    getSnapshot() {
        return {
            ball: { x: this.ball.x, y: this.ball.y, width: this.ball.width, height: this.ball.height, color: this.ball.color },
            paddles: this.paddles.map(p => ({ x: p.x, y: p.y, width: p.width, height: p.height, color: p.color })),
            scores: { ...this.scores },
            running: this.running,
            tracker: this.tracker.getStats(),
        };
    }
}
