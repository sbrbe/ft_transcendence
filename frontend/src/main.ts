import { OnlineClient } from './onlineClient.js';
import { GameLogic } from '../engine_play/dist/game_logic.js';
import type { GameState, PlayerInfo } from '../engine_play/dist/types.js';
import type { gameConfig } from '../engine_play/dist/types.js';
type gameMode = "1v1" | "2v2" | "CPU" | "tournament";

class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private startTime: number;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Impossible d'obtenir le contexte 2D");
    this.ctx = ctx;
    this.startTime = performance.now();
  }

  drawDashedLine(pattern: number[]) {
    this.ctx.strokeStyle = 'white';
    this.ctx.setLineDash(pattern);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
  }

  endScreen(state: GameState): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    const centerX = this.canvas.width / 2;
    let y = this.canvas.height / 2 - 60;
    ctx.fillText(`Gagnant : ${state.tracker?.winner ?? '—'}`, centerX, y);
    y += 40;
    ctx.fillText(`Total échanges : ${state.tracker?.totalExchanges ?? 0}`, centerX, y);
    y += 30;
    ctx.fillText(`Rallye max : ${state.tracker?.maxRally ?? 0}`, centerX, y);
  }

  public clearRender()
  {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // this.ctx.fillText('Matchmaking...', (this.canvas.width / 2), (this.canvas.height / 2));
  }

  drawMessage(text: string) {
    this.ctx.fillStyle = "white";
    this.ctx.font = "32px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
  }
  

  draw(state: ReturnType<GameLogic["getGameState"]>) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawDashedLine([10, 10]);

    // balle
    this.ctx.fillStyle = state.ball.color;
    this.ctx.fillRect(state.ball.x, state.ball.y, state.ball.width, state.ball.height);

    // raquettes
    state.paddles.forEach(p => {
      if (!p) return;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    // noms au lancement (3 s)
    const elapsed = (performance.now() - this.startTime) / 1000;
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "white";
    if (elapsed < 3) {
      let x: number;
      state.paddles.forEach((paddle, index) => {
        if (!paddle) return;
        if (index % 2 === 0) {
          this.ctx.textAlign = "left";
          x = paddle.x;
        } else {
          this.ctx.textAlign = "right";
          x = paddle.x + paddle.width;
        }
        this.ctx.fillText(paddle.name, x, paddle.y - 15);
      });
    }

    // score
    this.ctx.font = "30px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(`${state.scores.A}    ${state.scores.B}`, this.canvas.width / 2, 40);
  }
}

class GameApp {
  // UI
  private canvas: HTMLCanvasElement;
  private menu: HTMLElement;
  private startBtn: HTMLButtonElement;
  private modeSelect: HTMLSelectElement;
  private config2v2: HTMLElement;
  private config1v1: HTMLElement;
  // en haut de la classe
private online: OnlineClient | null = null;

private mobileTouchAttached = false;

private isOnlineMode(): boolean {
  return !!this.online;
}

private setMobileControlsActive(active: boolean) {
  const el = document.getElementById('mobile-controls');
  if (el) el.classList.toggle('active', active);
}



private attachMobileTouch() {
  if (this.mobileTouchAttached) return;
  if (this.btnUp) {
    this.btnUp.addEventListener('touchstart', this.btnUpDownHandler, { passive: false });
    this.btnUp.addEventListener('touchend', this.btnUpUpHandler,   { passive: false });
    this.btnUp.addEventListener('touchcancel', this.btnUpUpHandler,{ passive: false });
  }
  if (this.btnDown) {
    this.btnDown.addEventListener('touchstart', this.btnDownDownHandler, { passive: false });
    this.btnDown.addEventListener('touchend', this.btnDownUpHandler,     { passive: false });
    this.btnDown.addEventListener('touchcancel', this.btnDownUpHandler,  { passive: false });
  }
  this.mobileTouchAttached = true;
}

private detachMobileTouch() {
  if (!this.mobileTouchAttached) return;
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

  // Sélecteurs joueurs
  private playerSelects2v2: HTMLSelectElement[];
  private playerSelects1v1: HTMLSelectElement[];

  // Boutons mobile
  private btnUp: HTMLButtonElement | null;
  private btnDown: HTMLButtonElement | null;

  // Jeu / rendu / boucle
  private game: GameLogic | null = null;
  private renderer: GameRenderer | null = null;
  private rafId: number | null = null;

  // Handlers (références pour add/remove)
  private keyDownHandler = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
    if (this.online) {
      if (e.key === 'ArrowUp') this.online.sendDir('up');
      else if (e.key === 'ArrowDown') this.online.sendDir('down');
    } else {
      this.game?.setPlayerInput(e.key, true);
    }
  };
  
  private keyUpHandler = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
    if (this.online) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') this.online.sendDir('stop');
    } else {
      this.game?.setPlayerInput(e.key, false);
    }
  };
  

  // Boutons : handlers tactile
  private btnUpDownHandler = (ev: Event) => {
    ev.preventDefault();
    if (!this.online) return;
    this.online.sendDir('up');
  };
  
  private btnUpUpHandler = (ev: Event) => {
    ev.preventDefault();
    if (!this.online) return;
    this.online.sendDir('stop');
  };
  
  private btnDownDownHandler = (ev: Event) => {
    ev.preventDefault();
    if (!this.online) return;
    this.online.sendDir('down');
  };
  
  private btnDownUpHandler = (ev: Event) => {
    ev.preventDefault();
    if (!this.online) return;
    this.online.sendDir('stop');
  };
  

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.menu = document.getElementById('menu-game-config')!;
    this.startBtn = document.getElementById('startBtn') as HTMLButtonElement;
    this.modeSelect = document.getElementById('modeSelect') as HTMLSelectElement;
    this.config2v2 = document.getElementById('custom-config_2vs2')!;
    this.config1v1 = document.getElementById('custom-config_1vs1')!;

    // Selects joueurs
    this.playerSelects2v2 = ['player1', 'player2', 'player3', 'player4']
      .map(id => document.getElementById(id) as HTMLSelectElement);

    this.playerSelects1v1 = ['player1-1v1', 'player2-1v1']
      .map(id => document.getElementById(id) as HTMLSelectElement);

    // Boutons mobile (assure-toi que ces IDs existent dans ton HTML)
    this.btnUp = document.getElementById('btn-up') as HTMLButtonElement | null;
    this.btnDown = document.getElementById('btn-down') as HTMLButtonElement | null;
    this.bindUI();
  }

  private showView(viewId: string) {
    ['view-home','view-game','view-register', 'menu-game-config'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = (id === viewId ? 'block' : 'none');
    });
  }


  private bindUI() {
    // nav (facultatif selon ton HTML)
    document.getElementById('nav-home')?.addEventListener('click', () => this.stopAndReturnToMenu());
    document.getElementById('nav-game-config')?.addEventListener('click', () => {
      this.stopAndReturnToMenu();
      this.showView('view-home');           // ton accueil
      this.menu.style.display = 'block';
      this.canvas.style.display = 'none';
    });

    document.getElementById('nav-game-online')
    ?.addEventListener('click', () => {
      this.stopAndReturnToMenu();
      this.startOnline()});

    // switch 1v1 / 2v2
    this.modeSelect.addEventListener('change', () => {
      const is2v2 = this.modeSelect.value === '2v2';
      this.config2v2.style.display = is2v2 ? 'block' : 'none';
      this.config1v1.style.display = is2v2 ? 'none' : 'block';
    });

    // start
    this.startBtn.addEventListener('click', () => {
      //chercher localstorage pour id joueur
        const mode = this.modeSelect.value as gameMode;
        const config: gameConfig = {
          mode,
          playerSetup: this.getCustomPlayers(mode)
        };
        this.launchLocalGame(config);
      });
  }

  private startOnline() {
    // nettoie un éventuel local game
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    this.detachInputListeners();
    (this.game as any)?.dispose?.();
    this.game = null;
  
    // UI
    this.menu.style.display = 'none';
    this.showView('view-game');
    this.canvas.style.display = 'block'; 
  
    // renderer seul (le serveur envoie l'état)
    this.renderer = new GameRenderer(this.canvas);
  
    // client WS
    this.online?.dispose();
    this.online = new OnlineClient(
      // onState
      (snap) => {
        if (!this.renderer) return;
        this.renderer.draw(snap);
        if (!snap.running) {
          this.renderer.endScreen(snap);
        }
      },
      // onInfo (optionnel)
      (msg) => {

        if (msg.type === "waiting") {
          this.renderer?.clearRender();
          this.renderer?.drawMessage("Matchmaking...");
        }
      }
    );
  
    this.online.connect();
    this.attachInputListeners();
  }
  

  private getCustomPlayers(mode: gameMode): PlayerInfo[] {
    const selects = mode === '2v2' ? this.playerSelects2v2 : this.playerSelects1v1;
    return selects.map((sel, index) => ({
      type: sel.value as "human" | "cpu" | null,
      playerId: index + 1
    }));
  }
  
  private attachInputListeners() {
    window.addEventListener('keydown', this.keyDownHandler, { passive: false });
    window.addEventListener('keyup', this.keyUpHandler, { passive: false });
  
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const smallScreen = window.matchMedia('(max-width: 820px)').matches;
  
    if (this.isOnlineMode() && isTouch && smallScreen) {
      this.attachMobileTouch();
      this.setMobileControlsActive(true);
    } else {
      this.detachMobileTouch();
      this.setMobileControlsActive(false);
    }
  }
  
  private detachInputListeners() {
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);
    this.detachMobileTouch();
    this.setMobileControlsActive(false);
  }
  
  

  private launchLocalGame(config: gameConfig) {
   // UI
    this.menu.style.display = 'none';
    this.showView('view-game');
    this.canvas.style.display = 'block'; 

    // Crée moteur + renderer
    this.game = new GameLogic(this.canvas.width, this.canvas.height, config);
    this.renderer = new GameRenderer(this.canvas);

    // Listeners input
    this.attachInputListeners();

    // Boucle
    const loop = () => {
      if (!this.game || !this.renderer) return;
      this.game.update();
      const state = this.game.getGameState();
      this.renderer.draw(state);

      if (state.running) {
        this.rafId = requestAnimationFrame(loop);
      } else {
        this.renderer.endScreen(state as unknown as GameState);
        // Option: on peut auto-nettoyer après l’écran de fin
        // this.stopAndReturnToMenu();
      }
    };
    this.rafId = requestAnimationFrame(loop);
  }

  // 🔧 Nettoyage complet + retour menu
  public stopAndReturnToMenu() {
    // Arrête la boucle
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Détache inputs
    this.detachInputListeners();

    // Dispose éventuel moteur
    (this.game as any)?.dispose?.();
    this.game = null;

    this.online?.dispose?.();
  this.online = null;
  
  if (this.renderer)
    this.renderer.clearRender();

    this.renderer = null;

    // UI
    this.showView('view-home');
  }
}

new GameApp();
