// app.ts — version unifiée
import { GameLogic } from './game_logic.js';
import type { gameConfig, PlayerInfo, PlayerType, gameMode } from './gameTypes.js';

// ⛳ Rendu séparé (Option A)
class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Impossible d'obtenir le contexte 2D");
    this.ctx = ctx;
  }
  private dashedMidline(pattern: number[]) {
    this.ctx.strokeStyle = 'white';
    this.ctx.setLineDash(pattern);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
  }
  draw(state: ReturnType<GameLogic["getGameState"]>) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.dashedMidline([10,10]);

    // balle
    this.ctx.fillStyle = state.ball.color;
    this.ctx.fillRect(state.ball.x, state.ball.y, state.ball.width, state.ball.height);

    // raquettes
    state.paddles.forEach(p => {
      if (!p) return;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    // score
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`${state.scores.A} - ${state.scores.B}`, this.canvas.width / 2 - 20, 30);
  }

  endScreen(state: any) {
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
  // UI
  private canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  private menu = document.getElementById('menu-game-config') as HTMLElement;
  private startBtn = document.getElementById('startBtn') as HTMLButtonElement;
  private modeSelect = document.getElementById('modeSelect') as HTMLSelectElement;
  private config2v2 = document.getElementById('custom-config_2vs2') as HTMLElement;
  private config1v1 = document.getElementById('custom-config_1vs1') as HTMLElement;

  // selects
  private selects1v1 = [
    document.getElementById('player1-1v1') as HTMLSelectElement,
    document.getElementById('player2-1v1') as HTMLSelectElement,
  ];
  private selects2v2 = ['player1','player2','player3','player4']
    .map(id => document.getElementById(id) as HTMLSelectElement);

  // jeu
  private logic: GameLogic | null = null;
  private renderer: GameRenderer | null = null;
  private rafId: number | null = null;

  // listeners à nettoyer
  private keydownHandler = (e: KeyboardEvent) => {
    // évite scroll sur flèches
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
    this.logic?.setPlayerInput(e.key, true);
  };
  private keyupHandler = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
    this.logic?.setPlayerInput(e.key, false);
  };

  constructor() {
    this.bindUI();
  }

  private bindUI() {
    // nav (facultatif selon ton HTML)
    document.getElementById('nav-home')?.addEventListener('click', () => this.quitToMenu());
    document.getElementById('nav-game-config')?.addEventListener('click', () => {
      this.quitToMenu();
      this.showView('view-home');           // ton accueil
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

  private showView(viewId: string) {
    ['view-home','view-game','view-register'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = (id === viewId ? 'block' : 'none');
    });
  }

  private getPlayerSetup(mode: gameMode): PlayerInfo[] {
    let raw: PlayerType[];
    if (mode === '1v1') {
      raw = this.selects1v1.map(s => s.value as PlayerType);
      // force longueur 2
      if (raw.length !== 2) raw = [raw[0] ?? 'human', raw[1] ?? 'human'];
    } else {
      raw = this.selects2v2.map(s => s.value as PlayerType);
      // force longueur 4
      while (raw.length < 4) raw.push(null);
    }
    // map → PlayerInfo[]
    return raw.map((t, i) => ({ type: t, playerId: i + 1 }));
  }

  private startGameFromUI() {
    const mode = this.modeSelect.value as gameMode;
    const config: gameConfig = {
      mode,
      playerSetup: this.getPlayerSetup(mode),
    };

    this.start(config);
  }

  // === Cycle de vie ===
  public start(config: gameConfig) {
    this.quitToMenu(); // tue proprement l’ancienne partie

    this.menu.style.display = 'none';
    this.canvas.style.display = 'block';
    this.showView('view-game');

    this.logic = new GameLogic(this.canvas, config);
    this.renderer = new GameRenderer(this.canvas);

    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);

    const loop = () => {
      if (!this.logic || !this.renderer) return;
      this.logic.update();
      const state = this.logic.getGameState();
      this.renderer.draw(state);
      if (state.running) {
        this.rafId = requestAnimationFrame(loop);
      } else {
        this.renderer.endScreen(state);
      }
    };
    loop();
  }

  public quitToMenu() {
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
