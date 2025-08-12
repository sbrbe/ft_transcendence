import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
import { Player } from './player.js';
import { CPU } from './CPU.js';
import { Tracker } from './tracker.js';
export class GameLogic {
    constructor(canvas, conf) {
        this.paddles = [];
        this.players = [];
        this.ais = [];
        // état de score
        this.scoreA = 0;
        this.scoreB = 0;
        this.running = true;
        // divers
        this.tracker = new Tracker();
        this.destroyed = false;
        this.canvas = canvas;
        this.config = conf;
        this.ball = new Ball(canvas.width / 2, canvas.height / 2, canvas.width / 80, canvas.width / 80, 'white', 'right');
        this.initPlayers();
        this.ball.spawn();
    }
    // --- Normalisation du setup (accepte PlayerInfo[] ou PlayerType[]) ---
    normalizeSetup() {
        const mode = this.config.mode;
        const fallback1v1 = ["human", "human"];
        const fallback2v2 = ["cpu", "cpu", "cpu", "cpu"];
        if (!this.config.playerSetup) {
            return mode === "2v2" ? fallback2v2 : fallback1v1;
        }
        // Si c'est déjà un tableau de strings/null
        const first = this.config.playerSetup[0];
        if (typeof first === "string" || first === null || first === undefined) {
            const arr = this.config.playerSetup;
            return mode === "2v2"
                ? (arr.concat([null, null, null, null]).slice(0, 4))
                : (arr.concat([null]).slice(0, 2));
        }
        // Sinon c'est un PlayerInfo[]
        const infos = this.config.playerSetup;
        const mapped = infos.map(pi => { var _a; return (_a = pi === null || pi === void 0 ? void 0 : pi.type) !== null && _a !== void 0 ? _a : null; });
        return this.config.mode === "2v2"
            ? (mapped.concat([null, null, null, null]).slice(0, 4))
            : (mapped.concat([null]).slice(0, 2));
    }
    initPlayers() {
        const paddleWidth = this.canvas.width / 80;
        const paddleHeight = this.canvas.height / 12;
        const margin = 5;
        const spacing = 30;
        const y = (this.canvas.height - paddleHeight) / 2;
        // positions: 2 de base (1v1) + 2 décalées (2v2)
        const positions = [
            { x: margin, y },
            { x: this.canvas.width - margin - paddleWidth, y },
            { x: margin * 2 + paddleWidth, y: y + spacing },
            { x: this.canvas.width - (margin * 4 + paddleWidth), y: y + spacing }
        ];
        // mappage touches pour chaque slot
        const controls = [
            { up: 'z', down: 's' }, // left #1
            { up: 'ArrowUp', down: 'ArrowDown' }, // right #1
            { up: 'e', down: 'd' }, // left #2
            { up: 'i', down: 'k' } // right #2
        ];
        const types = this.normalizeSetup(); // longueur 2 (1v1) ou 4 (2v2)
        const slots = (this.config.mode === "2v2") ? 4 : 2;
        for (let i = 0; i < 4; i++) {
            const type = (i < slots) ? types[i] : null;
            if (type === null) {
                this.paddles.push(null);
                this.players.push(null);
                this.ais.push(null);
                continue;
            }
            const paddle = new Paddle(positions[i].x, positions[i].y, paddleWidth, paddleHeight, 'white', 15);
            this.paddles.push(paddle);
            if (type === "human") {
                // Player "humain" → n’accepte que e.isTrusted === true
                this.players.push(new Player(paddle, controls[i], { source: 'human' }));
                this.ais.push(null);
            }
            else {
                // Slot IA : Player “synthetic-only” + CPU qui envoie des KeyboardEvents synthétiques
                this.players.push(new Player(paddle, controls[i], { source: 'synthetic' }));
                this.ais.push(new CPU(paddle, controls[i]));
            }
        }
    }
    // --- API d’input pour les humains (via app: listeners keydown/keyup réels) ---
    setPlayerInput(key, isPressed) {
        var _a, _b;
        for (const player of this.players) {
            if (!player)
                continue;
            (_b = (_a = player).onHumanInput) === null || _b === void 0 ? void 0 : _b.call(_a, key, isPressed); // ← laisse Player filtrer
        }
    }
    // --- Boucle logique ---
    isEnd() {
        if ((this.scoreA >= 11 || this.scoreB >= 11) && Math.abs(this.scoreA - this.scoreB) > 2) {
            this.tracker.setWinner(this.scoreA > this.scoreB ? "Team 1" : "Team 2");
            this.running = false;
            return true;
        }
        return false;
    }
    update() {
        if (this.destroyed)
            return;
        // 1) IA choisit et simule les keydown/keyup synthétiques
        this.ais.forEach((cpu, i) => {
            if (cpu && this.paddles[i])
                cpu.update(this.ball, this.canvas.height);
        });
        // 2) Tous les Players (humains + “synthetic-only”) appliquent le mouvement à leur paddle
        this.players.forEach((pl, i) => {
            if (pl && this.paddles[i])
                pl.update(this.ball, this.canvas.height);
        });
        // 3) Physique balle/collisions
        const activePaddles = this.paddles.filter(Boolean);
        this.ball.colisionMultiple(activePaddles, this.canvas.height, this.tracker);
        this.ball.update();
        // 4) But ?
        if (this.ball.goal(this.canvas.width)) {
            // reset IA pour ne pas “tenir” des touches après point
            this.ais.forEach(cpu => { cpu === null || cpu === void 0 ? void 0 : cpu.release(); cpu === null || cpu === void 0 ? void 0 : cpu.resetTime(); });
            if (this.ball.x <= 0)
                this.scoreB++;
            else
                this.scoreA++;
            this.tracker.resetExchange();
            if (this.isEnd())
                return;
            // remise en jeu alternée
            this.ball.x = this.canvas.width / 2;
            this.ball.y = ((this.scoreA + this.scoreB) % 2 === 0)
                ? this.canvas.height - this.canvas.height / 4
                : this.canvas.height / 4;
            this.ball.spawn();
        }
    }
    // --- State minimal pour le renderer ---
    getGameState() {
        return {
            ball: {
                x: this.ball.x,
                y: this.ball.y,
                width: this.ball.width,
                height: this.ball.height,
                color: this.ball.color
            },
            paddles: this.paddles.map(p => p ? {
                x: p.x, y: p.y, width: p.width, height: p.height, color: p.color
            } : null),
            scores: { A: this.scoreA, B: this.scoreB },
            running: this.running,
            traker: this.tracker.getStats(),
        };
    }
    // --- Nettoyage propre (à appeler depuis l’app quand on quitte la partie) ---
    dispose() {
        if (this.destroyed)
            return;
        this.destroyed = true;
        this.running = false;
        // arrêter les IA (relâcher touches synthétiques)
        this.ais.forEach(cpu => cpu === null || cpu === void 0 ? void 0 : cpu.release());
        // retirer listeners côté Player (si Player expose destroy)
        this.players.forEach(p => { var _a; return (_a = p === null || p === void 0 ? void 0 : p.destroy) === null || _a === void 0 ? void 0 : _a.call(p); });
        // vider les tableaux pour éviter mélanges en relançant une partie
        this.ais.length = 0;
        this.players.length = 0;
        this.paddles.length = 0;
        // reset tracker
        this.tracker = new Tracker();
        // hard reset du canvas (efface et réinitialise le contexte)
        const w = this.canvas.width, h = this.canvas.height;
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.setLineDash([]);
            ctx.clearRect(0, 0, w, h);
        }
        this.canvas.width = w; // force réinit du contexte 2D
    }
}
