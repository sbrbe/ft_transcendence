import { GameLogic } from '../../../../shared/engine_play/src/game_logic';
import type { GameState, PlayerInfo, gameConfig } from '../../../../shared/engine_play/src/types';
import { GameRenderer } from './renderer'
import type { Disposable } from "./runtime";

export class GameLocal implements Disposable{

  private canvas: HTMLCanvasElement;
  private renderer: GameRenderer; 
  private game: GameLogic | null = null;
  private rafId: number | null = null;
  
  private betweenStage: 'idle' | 'winner' | 'endLcl' = 'idle';

  constructor(conf: { mode: "1v1" | "2v2"; players: ("human" | "cpu")[] }) {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.renderer = new GameRenderer(this.canvas);
    this.startLocalFromConf(conf);
  }

  private keyDownHandler = (e: KeyboardEvent) => {
    const code = e.code;
    
    if (code === 'Space') {
      if (this.betweenStage === 'winner') {
        e.preventDefault();
        this.betweenStage = 'idle';
        return;
      }
      if (this.betweenStage === 'endLcl') {
        e.preventDefault();
        window.location.href = "/#/home";
        this.betweenStage = 'idle';
        return;
      }
    }
    if (code === 'ArrowUp' || code === 'ArrowDown') e.preventDefault();
    this.game?.setPlayerInput(e.key, true);
  };
  
  private keyUpHandler = (e: KeyboardEvent) => {
    const code = e.code;
    
    if (code === 'Space' && (this.betweenStage === 'winner')) {
      e.preventDefault();
      return;
    }
    
    if (code === 'ArrowUp' || code === 'ArrowDown') e.preventDefault();
    this.game?.setPlayerInput(e.key, false);
  };


  private attachInputListeners() {
    window.addEventListener('keydown', this.keyDownHandler, { passive: false });
    window.addEventListener('keyup', this.keyUpHandler, { passive: false });
  }
  
  private detachInputListeners() {
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);
  }
  
  private launchLocalGame(config: gameConfig) {
    this.game = new GameLogic(this.canvas.width, this.canvas.height, config);

    this.attachInputListeners();

    const loop = () => {
      if (!this.game || !this.renderer) return;
      this.game.update();
      const state = this.game.getGameState();
      this.renderer.draw(state);

      if (state.running) {
        this.rafId = requestAnimationFrame(loop);
      } else {
        this.betweenStage = 'endLcl';
        this.renderer.endScreen(state as unknown as GameState);
      }
    };
    this.rafId = requestAnimationFrame(loop);
  }

private buildPlayersFromConf(conf: { mode: "1v1" | "2v2"; players: ("human" | "cpu")[] }): PlayerInfo[] {
  const targetLen = conf.mode === "2v2" ? 4 : 2;
  const cfplay = conf.players.slice(0, targetLen);

  return cfplay.map((kind, idx): PlayerInfo => ({
    type: kind,
    playerId: idx + 1,
    name: `P${idx + 1}`,

  }));
}

private startLocalFromConf(conf: { mode: "1v1" | "2v2"; players: ("human" | "cpu")[] }) {
  const players = this.buildPlayersFromConf(conf);

  const cfg: gameConfig = {
    mode: conf.mode,
    playerSetup: players,
  };
  this.launchLocalGame(cfg);
}

  dispose() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.detachInputListeners();
    this.game = null;
    window.removeEventListener('keydown', this.keyDownHandler as any);
    window.removeEventListener('keyup', this.keyUpHandler as any);

    if (this.renderer)
      this.renderer.clearRender();
  }
}
