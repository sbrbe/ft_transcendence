import { Paddle } from '../engine_play/dist/paddle.js';
import { Ball } from '../engine_play/dist/ball.js';
import { KeyboardAdapter } from './KeyboardAdapter.js';
import { Tracker } from '../engine_play/dist/tracker.js';
import { CPU } from './CPU.js';
// GameState local (si tu ne veux pas dépendre de /types.js)
// export interface GameState {
//   ball: { x:number; y:number; width:number; height:number; color:string; };
//   paddles: ({ name: string; x:number; y:number; width:number; height:number; color:string } | null)[];
//   scores: { A:number; B:number };
//   running: boolean;
//   tracker: { winner:string|null; totalExchanges:number; maxRally:number };
// }
//type PlayerType = 'human' | 'cpu' | null;
export class GameLogic {
    constructor(canvas, conf) {
        this.paddles = [];
        this.adapters = []; // ← rename clair
        this.ais = [];
        this.scoreA = 0;
        this.scoreB = 0;
        this.running = true;
        this.tracker = new Tracker();
        this.destroyed = false;
        this.accumulator = 0;
        this.lastFrameMs = performance.now();
        this.stepMs = 1000 / 60;
        this.canvas = canvas;
        this.ball = new Ball(canvas.width / 2, canvas.height / 2, canvas.width / 80, canvas.width / 80, 'white', 'right');
        this.initPlayers(conf.mode, conf.playerSetup);
        this.ball.spawn();
    }
    normalizeSetup(mode, raw) {
        const fb1 = ['human', 'human'];
        const fb2 = ['cpu', 'cpu', 'cpu', 'cpu'];
        if (!raw)
            return mode === '2v2' ? fb2 : fb1;
        return (mode === '2v2')
            ? raw.concat([null, null, null, null]).slice(0, 4)
            : raw.concat([null]).slice(0, 2);
    }
    initPlayers(mode, raw) {
        const paddleWidth = this.canvas.width / 80;
        const paddleHeight = this.canvas.height / 12;
        const margin = 5;
        const spacing = 30;
        const y = (this.canvas.height - paddleHeight) / 2;
        const positions = [
            { x: margin, y },
            { x: this.canvas.width - margin - paddleWidth, y },
            { x: margin * 2 + paddleWidth, y: y + spacing },
            { x: this.canvas.width - (margin * 4 + paddleWidth), y: y + spacing }
        ];
        const controls = [
            { up: 'z', down: 's' },
            { up: 'ArrowUp', down: 'ArrowDown' },
            { up: 'e', down: 'd' },
            { up: 'i', down: 'k' },
        ];
        const types = this.normalizeSetup(mode, raw);
        const slots = mode === '2v2' ? 4 : 2;
        for (let i = 0; i < 4; i++) {
            const type = (i < slots) ? types[i] : null;
            if (type === null) {
                this.paddles.push(null);
                this.adapters.push(null);
                this.ais.push(null);
                continue;
            }
            const paddle = new Paddle(positions[i].x, positions[i].y, paddleWidth, paddleHeight, 'white', 15);
            this.paddles.push(paddle);
            // ✅ instancier l’adapter (sans paddle)
            const adapter = new KeyboardAdapter(controls[i], { source: type === 'human' ? 'human' : 'synthetic' });
            this.adapters.push(adapter);
            if (type === 'cpu') {
                // ✅ passer l’adapter au CPU
                this.ais.push(new CPU(paddle, mode, i, this.canvas.height, controls[i], adapter));
            }
            else {
                this.ais.push(null);
            }
        }
    }
    setPlayerInput(key, isPressed) {
        for (const adapter of this.adapters) {
            adapter?.onHumanInput?.(key, isPressed);
        }
    }
    isEnd() {
        if ((this.scoreA >= 11 || this.scoreB >= 11) && Math.abs(this.scoreA - this.scoreB) > 2) {
            this.tracker.setWinner(this.scoreA > this.scoreB ? 'Team 1' : 'Team 2');
            this.running = false;
            return true;
        }
        return false;
    }
    updateFrame(nowMs) {
        const elapsed = nowMs - this.lastFrameMs;
        this.lastFrameMs = nowMs;
        this.accumulator += elapsed;
        while (this.accumulator >= this.stepMs) {
            this.updateFixed(this.stepMs);
            this.accumulator -= this.stepMs;
        }
    }
    updateFixed(dtMs) {
        if (this.destroyed)
            return;
        // 1) IA : décide et met à jour l’adapter (pressSynthetic)
        this.ais.forEach((cpu, i) => {
            if (cpu && this.paddles[i])
                cpu.update(this.ball, this.canvas.height);
        });
        // 2) Appliquer les inputs adapter → paddles (remplace Player.update)
        for (let i = 0; i < this.adapters.length; i++) {
            const adapter = this.adapters[i];
            const paddle = this.paddles[i];
            if (!adapter || !paddle)
                continue;
            const dir = adapter.getDirection();
            if (dir === 'up' && paddle.y > 0) {
                paddle.move(-paddle.speed);
            }
            else if (dir === 'down' && (paddle.y + paddle.height < this.canvas.height)) {
                paddle.move(paddle.speed);
            }
        }
        // 3) Collisions
        const activePaddles = this.paddles.filter(Boolean);
        this.ball.collisionMultiple(activePaddles, this.canvas.height, this.tracker, dtMs);
        // 4) Avance la balle
        this.ball.update(dtMs);
        // 5) But ?
        if (this.ball.goal(this.canvas.width)) {
            this.ais.forEach(cpu => { cpu?.release(); cpu?.resetTime(); });
            if (this.ball.x <= 0)
                this.scoreB++;
            else
                this.scoreA++;
            this.tracker.resetExchange();
            if (this.isEnd())
                return;
            this.ball.x = this.canvas.width / 2;
            this.ball.y = ((this.scoreA + this.scoreB) % 2 === 0)
                ? this.canvas.height - this.canvas.height / 4
                : this.canvas.height / 4;
            this.ball.spawn();
        }
    }
    getGameState() {
        return {
            ball: {
                x: this.ball.x,
                y: this.ball.y,
                width: this.ball.width,
                height: this.ball.height,
                color: this.ball.color
            },
            paddles: this.paddles.map((p, i) => p ? {
                name: this.adapters[i]?.name ?? `P${i + 1}`, // ← on utilise le nom de l'adapter
                x: p.x,
                y: p.y,
                width: p.width,
                height: p.height,
                color: p.color
            } : null),
            scores: { A: this.scoreA, B: this.scoreB },
            running: this.running,
            tracker: this.tracker.getStats(),
        };
    }
    dispose() {
        if (this.destroyed)
            return;
        this.destroyed = true;
        this.running = false;
        this.ais.forEach(cpu => cpu?.release());
        this.adapters.forEach(a => a?.destroy());
        this.ais.length = 0;
        this.adapters.length = 0;
        this.paddles.length = 0;
        this.tracker = new Tracker();
        const w = this.canvas.width, h = this.canvas.height;
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.setLineDash([]);
            ctx.clearRect(0, 0, w, h);
        }
        this.canvas.width = w;
    }
}
