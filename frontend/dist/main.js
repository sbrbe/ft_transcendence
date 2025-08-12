// app.ts — version unifiée
import { GameLogic } from './game_logic.js';
// ⛳ Rendu séparé (Option A)
class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error("Impossible d'obtenir le contexte 2D");
        this.ctx = ctx;
    }
    dashedMidline(pattern) {
        this.ctx.strokeStyle = 'white';
        this.ctx.setLineDash(pattern);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
    }
    draw(state) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.dashedMidline([10, 10]);
        // balle
        this.ctx.fillStyle = state.ball.color;
        this.ctx.fillRect(state.ball.x, state.ball.y, state.ball.width, state.ball.height);
        // raquettes
        state.paddles.forEach(p => {
            if (!p)
                return;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.width, p.height);
        });
        // score
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`${state.scores.A} - ${state.scores.B}`, this.canvas.width / 2 - 20, 30);
    }
    endScreen(state) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        const cx = this.canvas.width / 2;
        let y = this.canvas.height / 2 - 60;
        ctx.fillText(`Gagnant : ${state.traker.winner}`, cx, y);
        y += 40;
        ctx.fillText(`Total échanges : ${state.traker.totalExchanges}`, cx, y);
        y += 30;
        ctx.fillText(`Rallye max : ${state.traker.maxRally}`, cx, y);
    }
}
// 🧠 App = colle UI + cycle de vie (start/quitToMenu) + vues
class GameApp {
    constructor() {
        // UI
        this.canvas = document.getElementById('gameCanvas');
        this.menu = document.getElementById('menu-game-config');
        this.startBtn = document.getElementById('startBtn');
        this.modeSelect = document.getElementById('modeSelect');
        this.config2v2 = document.getElementById('custom-config_2vs2');
        this.config1v1 = document.getElementById('custom-config_1vs1');
        // selects
        this.selects1v1 = [
            document.getElementById('player1-1v1'),
            document.getElementById('player2-1v1'),
        ];
        this.selects2v2 = ['player1', 'player2', 'player3', 'player4']
            .map(id => document.getElementById(id));
        // jeu
        this.logic = null;
        this.renderer = null;
        this.rafId = null;
        // listeners à nettoyer
        this.keydownHandler = (e) => {
            var _a;
            // évite scroll sur flèches
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown')
                e.preventDefault();
            (_a = this.logic) === null || _a === void 0 ? void 0 : _a.setPlayerInput(e.key, true);
        };
        this.keyupHandler = (e) => {
            var _a;
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown')
                e.preventDefault();
            (_a = this.logic) === null || _a === void 0 ? void 0 : _a.setPlayerInput(e.key, false);
        };
        this.bindUI();
    }
    bindUI() {
        var _a, _b;
        // nav (facultatif selon ton HTML)
        (_a = document.getElementById('nav-home')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.quitToMenu());
        (_b = document.getElementById('nav-game-config')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            this.quitToMenu();
            this.showView('view-home'); // ton accueil
            this.menu.style.display = 'block';
            this.canvas.style.display = 'none';
        });
        // switch 1v1 / 2v2
        this.modeSelect.addEventListener('change', () => {
            const is2v2 = this.modeSelect.value === '2v2';
            this.config2v2.style.display = is2v2 ? 'block' : 'none';
            this.config1v1.style.display = is2v2 ? 'none' : 'block';
        });
        // start
        this.startBtn.addEventListener('click', () => this.startGameFromUI());
    }
    showView(viewId) {
        ['view-home', 'view-game', 'view-register'].forEach(id => {
            const el = document.getElementById(id);
            if (el)
                el.style.display = (id === viewId ? 'block' : 'none');
        });
    }
    getPlayerSetup(mode) {
        var _a, _b;
        let raw;
        if (mode === '1v1') {
            raw = this.selects1v1.map(s => s.value);
            // force longueur 2
            if (raw.length !== 2)
                raw = [(_a = raw[0]) !== null && _a !== void 0 ? _a : 'human', (_b = raw[1]) !== null && _b !== void 0 ? _b : 'human'];
        }
        else {
            raw = this.selects2v2.map(s => s.value);
            // force longueur 4
            while (raw.length < 4)
                raw.push(null);
        }
        // map → PlayerInfo[]
        return raw.map((t, i) => ({ type: t, playerId: i + 1 }));
    }
    startGameFromUI() {
        const mode = this.modeSelect.value;
        const config = {
            mode,
            playerSetup: this.getPlayerSetup(mode),
        };
        this.start(config);
    }
    // === Cycle de vie ===
    start(config) {
        this.quitToMenu(); // tue proprement l’ancienne partie
        this.menu.style.display = 'none';
        this.canvas.style.display = 'block';
        this.showView('view-game');
        this.logic = new GameLogic(this.canvas, config);
        this.renderer = new GameRenderer(this.canvas);
        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
        const loop = () => {
            if (!this.logic || !this.renderer)
                return;
            this.logic.update();
            const state = this.logic.getGameState();
            this.renderer.draw(state);
            if (state.running) {
                this.rafId = requestAnimationFrame(loop);
            }
            else {
                this.renderer.endScreen(state);
            }
        };
        loop();
    }
    quitToMenu() {
        // stop RAF
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        // nettoie listeners
        window.removeEventListener('keydown', this.keydownHandler);
        window.removeEventListener('keyup', this.keyupHandler);
        // libère la logique (si tu as des timers internes, ajoute un dispose())
        this.logic = null;
        this.renderer = null;
        // UI
        this.canvas.style.display = 'none';
        this.menu.style.display = 'block';
        this.showView('view-home');
    }
}
// bootstrap
new GameApp();
