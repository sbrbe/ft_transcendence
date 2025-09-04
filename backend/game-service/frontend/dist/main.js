import { OnlineClient } from './onlineClient.js';
import { GameLogic } from '../engine_play/dist/game_logic.js';
class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error("Impossible d'obtenir le contexte 2D");
        this.ctx = ctx;
        this.startTime = performance.now();
    }
    drawDashedLine(pattern) {
        this.ctx.strokeStyle = 'white';
        this.ctx.setLineDash(pattern);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
    }
    endScreen(state) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        const centerX = this.canvas.width / 2;
        let y = this.canvas.height / 2 - 60;
        ctx.fillText(`Gagnant : ${state.tracker?.winner?.name ?? '—'}`, centerX, y);
        y += 40;
        ctx.fillText(`Total échanges : ${state.tracker?.totalExchanges ?? 0}`, centerX, y);
        y += 30;
        ctx.fillText(`Rallye max : ${state.tracker?.maxRally ?? 0}`, centerX, y);
        ctx.fillText('Appuyez sur [Espace] pour continuer', centerX, (y + 150));
    }
    clearRender() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // this.ctx.fillText('Matchmaking...', (this.canvas.width / 2), (this.canvas.height / 2));
    }
    // Dans GameRenderer
    drawMessage(text, opts = {}) {
        const ctx = this.ctx;
        const { width, height } = this.canvas;
        const lines = String(text).split(/\r?\n/); // ← gère \n
        const lineHeight = opts.lineHeight ?? 24;
        ctx.save();
        ctx.textAlign = opts.align ?? 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '30px sans-serif';
        ctx.fillStyle = 'white';
        const x = opts.x ?? width / 2;
        // centre verticalement le bloc de lignes
        let y = opts.y ?? (height / 2 - ((lines.length - 1) * lineHeight) / 2);
        for (const line of lines) {
            ctx.fillText(line, x, y);
            y += lineHeight;
        }
        ctx.restore();
    }
    draw(state) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawDashedLine([10, 10]);
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
        this.isStarting(state.ball.height, state.ball.width, state.ball.x, state.ball.y, state.tracker.totalExchanges, state.scores);
        // noms au lancement (3 s)
        const elapsed = (performance.now() - this.startTime) / 1000;
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "white";
        if (elapsed < 3) {
            let x;
            state.paddles.forEach((paddle, index) => {
                if (!paddle)
                    return;
                if (index % 2 === 0) {
                    this.ctx.textAlign = "left";
                    x = paddle.x;
                }
                else {
                    this.ctx.textAlign = "right";
                    x = paddle.x + paddle.width;
                }
                this.ctx.fillText(paddle.name.substring(0, 10), x, paddle.y - 15);
            });
        }
        // score
        this.ctx.font = "30px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`${state.scores.A}    ${state.scores.B}`, this.canvas.width / 2, 40);
    }
    isStarting(BallH, BallW, BallX, BallY, echanges, score) {
        let scores_echanges = score.A + score.B + echanges;
        let ball = ((this.canvas.height / 2) - BallH / 2) + ((this.canvas.width / 2) - BallW / 2);
        if (ball && scores_echanges == 0) {
            this.startTime = performance.now();
        }
    }
}
class GameApp {
    isOnlineMode() {
        return !!this.online;
    }
    setMobileControlsActive(active) {
        const el = document.getElementById('mobile-controls');
        if (el)
            el.classList.toggle('active', active);
    }
    attachMobileTouch() {
        if (this.mobileTouchAttached)
            return;
        if (this.btnUp) {
            this.btnUp.addEventListener('touchstart', this.btnUpDownHandler, { passive: false });
            this.btnUp.addEventListener('touchend', this.btnUpUpHandler, { passive: false });
            this.btnUp.addEventListener('touchcancel', this.btnUpUpHandler, { passive: false });
        }
        if (this.btnDown) {
            this.btnDown.addEventListener('touchstart', this.btnDownDownHandler, { passive: false });
            this.btnDown.addEventListener('touchend', this.btnDownUpHandler, { passive: false });
            this.btnDown.addEventListener('touchcancel', this.btnDownUpHandler, { passive: false });
        }
        this.mobileTouchAttached = true;
    }
    detachMobileTouch() {
        if (!this.mobileTouchAttached)
            return;
        if (this.btnUp) {
            this.btnUp.removeEventListener('touchstart', this.btnUpDownHandler);
            this.btnUp.removeEventListener('touchend', this.btnUpUpHandler);
            this.btnUp.removeEventListener('touchcancel', this.btnUpUpHandler);
        }
        if (this.btnDown) {
            this.btnDown.removeEventListener('touchstart', this.btnDownDownHandler);
            this.btnDown.removeEventListener('touchend', this.btnDownUpHandler);
            this.btnDown.removeEventListener('touchcancel', this.btnDownUpHandler);
        }
        this.mobileTouchAttached = false;
    }
    constructor() {
        // UI
        this.tournament = null;
        this.configTournament = null;
        // en haut de la classe
        this.online = null;
        this.mobileTouchAttached = false;
        // Jeu / rendu / boucle
        this.game = null;
        this.rafId = null;
        this.betweenStage = 'idle';
        this._prevRunning = null;
        this.keyDownHandler = (e) => {
            const code = e.code;
            if (code === 'Space') {
                if (this.betweenStage === 'winner') {
                    e.preventDefault();
                    this.betweenStage = 'next';
                    this.showNextMatchScreen();
                    return;
                }
                if (this.betweenStage === 'next') {
                    e.preventDefault();
                    this.online?.sendContinue();
                    this.betweenStage = 'idle';
                    this.renderer?.clearRender();
                    return;
                }
                if (this.betweenStage === 'end' || this.betweenStage === 'endOln' || this.betweenStage === 'endLcl') {
                    e.preventDefault();
                    this.stopAndReturnToMenu();
                    if (this.betweenStage === 'end')
                        this.showView('Tournois');
                    else if (this.betweenStage === 'endOln')
                        this.showView('online-options');
                    else
                        this.showView('menu-game-config');
                    this.betweenStage = 'idle';
                    return;
                }
            }
            // Empêche le scroll avec les flèches
            if (code === 'ArrowUp' || code === 'ArrowDown')
                e.preventDefault();
            if (this.online) {
                if (code === 'ArrowUp' || code === 'ArrowDown' || code === 'KeyW' || code === 'KeyS') {
                    e.preventDefault();
                    this.online.sendKey(code, true);
                    return;
                }
            }
            if (this.tournament) {
                this.tournament.redirectTournament(code, true);
                return;
            }
            this.game?.setPlayerInput(e.key, true);
        };
        this.keyUpHandler = (e) => {
            const code = e.code;
            // Espace “between stages” (tournoi)
            if (code === 'Space' && (this.betweenStage === 'winner' || this.betweenStage === 'next' || this.betweenStage === 'end')) {
                e.preventDefault();
                return;
            }
            if (code === 'ArrowUp' || code === 'ArrowDown')
                e.preventDefault();
            if (this.online) {
                if (code === 'ArrowUp' || code === 'ArrowDown' || code === 'KeyW' || code === 'KeyS') {
                    e.preventDefault();
                    this.online.sendKey(code, false);
                    return;
                }
            }
            if (this.tournament) {
                this.tournament.redirectTournament(code, false);
                return;
            }
            this.game?.setPlayerInput(e.key, false);
        };
        // Boutons : handlers tactile
        this.btnUpDownHandler = (ev) => {
            ev.preventDefault();
            if (!this.online)
                return;
            this.online.sendDir('up');
        };
        this.btnUpUpHandler = (ev) => {
            ev.preventDefault();
            if (!this.online)
                return;
            this.online.sendDir('stop');
        };
        this.btnDownDownHandler = (ev) => {
            ev.preventDefault();
            if (!this.online)
                return;
            this.online.sendDir('down');
        };
        this.btnDownUpHandler = (ev) => {
            ev.preventDefault();
            if (!this.online)
                return;
            this.online.sendDir('stop');
        };
        this.loopTimer = null;
        this.lobbyId = null;
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new GameRenderer(this.canvas);
        this.startBtn = document.getElementById('startBtn');
        this.startBtnTournois = document.getElementById('startTournamentBtn');
        this.modeSelect = document.getElementById('modeSelect');
        this.tournois_select = document.getElementById('tournamentSize');
        this.config2v2 = document.getElementById('custom-config_2vs2');
        this.config1v1 = document.getElementById('custom-config_1vs1');
        this.playersWrap = document.getElementById('tournamentPlayers');
        this.playerRows = Array.from(this.playersWrap.querySelectorAll('.player-row'));
        // Selects joueurs
        this.playerSelects2v2 = ['player1', 'player2', 'player3', 'player4']
            .map(id => document.getElementById(id));
        this.playerSelects1v1 = ['player1-1v1', 'player2-1v1']
            .map(id => document.getElementById(id));
        // Boutons mobile (assure-toi que ces IDs existent dans ton HTML)
        this.btnUp = document.getElementById('btn-up');
        this.btnDown = document.getElementById('btn-down');
        this.bindUI();
    }
    showView(viewId) {
        ['view-home', 'view-game', 'view-register', 'view-login', 'view-settings', 'view-edit-settings', 'view-profile', 'menu-game-config', 'Tournois', 'pong-options', 'local-options', 'online-options', 'online-tournament', 'tournament-lobby'].forEach(id => {
            const el = document.getElementById(id);
            if (el)
                el.style.display = (id === viewId ? 'block' : 'none');
            //console.log(viewId);
        });
    }
    // Affiche les N premières lignes (4/8/16)
    showFirst(n) {
        this.playerRows.forEach((row, i) => {
            row.style.display = i < n ? '' : 'none';
        });
    }
    // lit la taille choisie (4/8/16)
    getSelectedTournamentSize() {
        const fs = document.getElementById('tournamentSize');
        const checked = fs.querySelector('input[name="tournamentSize"]:checked');
        return checked ? parseInt(checked.value, 10) : 4;
    }
    // récupère les n premiers noms depuis #tournamentPlayers
    getTournamentPlayersFromInputs(n) {
        const inputs = Array.from(document.querySelectorAll('#tournamentPlayers input[type="text"]'));
        return inputs.slice(0, n).map((inp, i) => {
            const val = (inp.value ?? '').trim();
            // fallback si vide/null => "Joueur X"
            const name = val.length > 0 ? val : `Joueur ${i + 1}`;
            return { id: i + 1, name };
        });
    }
    bindUI() {
        document.getElementById('pong-online')?.addEventListener('click', () => {
            this.stopAndReturnToMenu();
            this.showView('online-options');
        });
        document.getElementById('pong')?.addEventListener('click', () => {
            this.stopAndReturnToMenu();
            this.showView('pong-options');
        });
        document.getElementById('pong-local')?.addEventListener('click', () => {
            this.stopAndReturnToMenu();
            this.showView('local-options');
        });
        document.getElementById('nav-home')?.addEventListener('click', () => this.stopAndReturnToMenu());
        document.getElementById('nav-game-config')?.addEventListener('click', () => {
            this.stopAndReturnToMenu();
            this.showView('menu-game-config'); // ton accueil
        });
        document.getElementById('nav-game-online')?.addEventListener('click', () => {
            this.stopAndReturnToMenu();
            this.startOnline();
        });
        document.getElementById('nav-game-tournois')?.addEventListener('click', () => {
            this.stopAndReturnToMenu();
            this.showView('Tournois');
        });
        // switch 1v1 / 2v2
        this.modeSelect.addEventListener('change', () => {
            const is2v2 = this.modeSelect.value === '2v2';
            this.config2v2.style.display = is2v2 ? 'block' : 'none';
            this.config1v1.style.display = is2v2 ? 'none' : 'block';
        });
        this.tournois_select.addEventListener('change', (e) => {
            const target = e.target;
            if (target && target.name === 'tournamentSize') {
                this.showFirst(parseInt(target.value, 10));
            }
        });
        //start tournois
        this.startBtnTournois.addEventListener('click', () => {
            //chercher localstorage pour id joueur
            this.startTournament();
        });
        // start local normal
        this.startBtn.addEventListener('click', () => {
            //chercher localstorage pour id joueur
            const mode = this.modeSelect.value;
            const config = {
                mode,
                playerSetup: this.getCustomPlayers(mode)
            };
            this.launchLocalGame(config);
        });
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async computeNextLabel() {
        const players = await this.online?.sendInfoPlayers();
        return players ?? null;
    }
    async showNextMatchScreen() {
        const label = (await this.computeNextLabel());
        this.renderer?.clearRender();
        this.renderer?.drawMessage(`Prochain match : ${label}\n\n[ESPACE] pour commencer`);
    }
    isMovementKey(code) {
        return code === 'ArrowUp' || code === 'ArrowDown' || code === 'KeyW' || code === 'KeyS';
    }
    startTournament() {
        this.showView('view-game');
        const size = this.getSelectedTournamentSize();
        const players = this.getTournamentPlayersFromInputs(size);
        this.configTournament = { players };
        // Ici on garde keyDownHandler / keyUpHandler pour Espace & UI, mais PAS pour mouvements.
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
        window.addEventListener('keydown', this.keyDownHandler, { passive: false });
        window.addEventListener('keyup', this.keyUpHandler, { passive: false });
        // Focus canvas pour capter le clavier
        document.activeElement?.blur?.();
        this.canvas.tabIndex = 0;
        this.canvas.focus();
        // Installe le handler “authoritative” (mouvements seulement)
        this.attachLocalAuthoritativeInputs();
        // WS
        this.online?.dispose();
        this.online = new OnlineClient((snap) => {
            if (!this.renderer)
                return;
            this.renderer.draw(snap);
            if (this._prevRunning === true && snap.running === false) {
                this.renderer.endScreen(snap);
                this.betweenStage = 'winner';
            }
            this._prevRunning = !!snap.running;
        }, (msg) => {
            if (msg.type === 'tournament_end') {
                this.betweenStage = 'end';
                this.renderer.clearRender();
                this.renderer.drawMessage('Tournoi terminé !\n\n\n\nAppuez sur [ESPACE] pour QUITTER !');
            }
        }, '/ws/local');
        this.online.connect().then(() => {
            if (this.configTournament)
                this.online.sendConfTournament(this.configTournament);
        });
    }
    // Envoie les 4 touches: flèches (joueur 1) + WS (joueur 2)
    attachLocalAuthoritativeInputs() {
        // Nettoie d'abord au cas où
        this.detachLocalAuthoritativeInputs();
        this.localKeysHandler = (e) => {
            const code = e.code;
            if (!this.isMovementKey(code))
                return; // ne gère QUE mouvements
            e.preventDefault();
            const isDown = e.type === 'keydown';
            this.online?.sendKey(code, isDown);
        };
        window.addEventListener('keydown', this.localKeysHandler, { passive: false });
        window.addEventListener('keyup', this.localKeysHandler, { passive: false });
    }
    detachLocalAuthoritativeInputs() {
        if (this.localKeysHandler) {
            window.removeEventListener('keydown', this.localKeysHandler);
            window.removeEventListener('keyup', this.localKeysHandler);
            this.localKeysHandler = undefined;
        }
    }
    startOnline() {
        this.showView('view-game');
        // client WS
        this.online?.dispose();
        this.online = new OnlineClient(
        // onState
        (snap) => {
            if (!this.renderer)
                return;
            this.renderer.draw(snap);
            if (!snap.running) {
                this.betweenStage = 'endOln';
                this.renderer.endScreen(snap);
            }
        }, 
        // onInfo (optionnel)
        (msg) => {
            if (msg.type === "waiting") {
                this.renderer.clearRender();
                this.renderer.drawMessage("Matchmaking...");
                console.log('efijnzbguhzbiu');
            }
        }, '/ws');
        this.online.connect();
        this.attachInputListeners();
    }
    getCustomPlayers(mode) {
        const selects = mode === '2v2' ? this.playerSelects2v2 : this.playerSelects1v1;
        return selects.map((sel, index) => ({
            type: sel.value,
            playerId: index + 1,
            name: "player"
        }));
    }
    attachInputListeners() {
        window.addEventListener('keydown', this.keyDownHandler, { passive: false });
        window.addEventListener('keyup', this.keyUpHandler, { passive: false });
        const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        const smallScreen = window.matchMedia('(max-width: 820px)').matches;
        if (this.isOnlineMode() && isTouch && smallScreen) {
            this.attachMobileTouch();
            this.setMobileControlsActive(true);
        }
        else {
            this.detachMobileTouch();
            this.setMobileControlsActive(false);
        }
    }
    detachInputListeners() {
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
        this.detachMobileTouch();
        this.setMobileControlsActive(false);
    }
    launchLocalGame(config) {
        // UI
        this.showView('view-game');
        // Crée moteur + renderer
        this.game = new GameLogic(this.canvas.width, this.canvas.height, config);
        // Listeners input
        this.attachInputListeners();
        // Boucle
        const loop = () => {
            if (!this.game || !this.renderer)
                return;
            this.game.update();
            const state = this.game.getGameState();
            this.renderer.draw(state);
            if (state.running) {
                this.rafId = requestAnimationFrame(loop);
            }
            else {
                this.betweenStage = 'endLcl';
                this.renderer.endScreen(state);
            }
        };
        this.rafId = requestAnimationFrame(loop);
    }
    // 🔧 Nettoyage complet + retour menu
    stopAndReturnToMenu() {
        // Arrête la boucle
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        // Détache inputs
        this.detachInputListeners();
        // Dispose éventuel moteur
        this.game?.dispose?.();
        this.game = null;
        this.online?.dispose?.();
        this.online = null;
        this.detachLocalAuthoritativeInputs();
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
        this.tournament?.dispose?.();
        this.tournament = null;
        if (this.renderer)
            this.renderer.clearRender();
        // UI
        this.showView('view-home');
    }
}
new GameApp();
