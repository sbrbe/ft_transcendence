import { GameRenderer } from './renderer.js'
import { OnlineClient } from './onlineClient.js';
import { Tournament, type buildTournament } from '../../../../engine_play/src/tournament_logic.js';
import { TournamentPlayer } from '../UI/pong_lcl_conftourn.js';
import type { Disposable } from "./runtime.js";

export class GameTournament implements Disposable{
  
	private tournament: Tournament | null = null;
	private canvas: HTMLCanvasElement;
	private renderer: GameRenderer; 
	private online: OnlineClient | null = null;
	private betweenStage: 'idle' | 'winner' |'next' | 'end' = 'idle';
	private _prevRunning: boolean | null = null;
	private conf: TournamentPlayer[];
	private configTournaments: buildTournament;
  constructor(conf: TournamentPlayer[]) {
	this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	this.renderer = new GameRenderer(this.canvas);
	this.conf = conf;
	this.startTournament();
  }
  
  
  private keyDownHandler = (e: KeyboardEvent) => {
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
      if (this.betweenStage === 'end') {
        e.preventDefault();
       window.location.href = "/#/home";
	   	this.betweenStage = 'idle';
        return;
      }
    }

    if (code === 'ArrowUp' || code === 'ArrowDown') e.preventDefault();
    if (this.tournament) {
      this.tournament.redirectTournament(code, true);
      return;
    }
  };
  
  private keyUpHandler = (e: KeyboardEvent) => {
    const code = e.code;
    
    if (code === 'Space' && (this.betweenStage === 'winner' || this.betweenStage === 'next' || this.betweenStage === 'end')) {
      e.preventDefault();
      return;
    }
    
    if (code === 'ArrowUp' || code === 'ArrowDown') e.preventDefault();
    if (this.tournament) {
      this.tournament.redirectTournament(code, false);
      return;
    }
  };


    private async computeNextLabel(): Promise<string | null> {
      const players = await this.online?.sendInfoPlayers();
      return players ?? null;
    }
    
    private async showNextMatchScreen() {
      const label = (await this.computeNextLabel());
      this.renderer?.clearRender();
      this.renderer?.drawMessage(`Next match : ${label}\n\n[SPACE] to start`);
    }

    private isMovementKey(code: string) {
      return code === 'ArrowUp' || code === 'ArrowDown' || code === 'KeyW' || code === 'KeyS';
    }
    
    private localKeysHandler?: (e: KeyboardEvent) => void;
    
    
    private startTournament() {
    
	const players = this.conf;
	this.configTournaments = { players };
      // Ici on garde keyDownHandler / keyUpHandler pour Espace & UI, mais PAS pour mouvements.
      window.removeEventListener('keydown', this.keyDownHandler as any);
      window.removeEventListener('keyup', this.keyUpHandler as any);
      window.addEventListener('keydown', this.keyDownHandler, { passive: false });
      window.addEventListener('keyup', this.keyUpHandler, { passive: false });
    
      (document.activeElement as HTMLElement)?.blur?.();
      this.canvas.tabIndex = 0;
      this.canvas.focus();

      this.attachLocalAuthoritativeInputs();
    
      this.online?.dispose();
      this.online = new OnlineClient(
        (snap) => {
          if (!this.renderer) return;
          this.renderer.draw(snap);
          if (this._prevRunning === true && snap.running === false) {
            this.renderer.endScreen(snap);
            this.betweenStage = 'winner';
          }
          this._prevRunning = !!snap.running;
        },
        (msg) => {
          if (msg.type === 'tournament_end') {
            this.betweenStage = 'end';
            this.renderer.clearRender();
            this.renderer.drawMessage('Tournoi finished !\n\n\n\nPress [SPACE] to QUIT !');
          }
        },
        '/game/tournament'
      ); 
    
      this.online.connect().then(() => {
	if (this.configTournaments)
			this.online!.sendConfTournament(this.configTournaments);
      });
    }
    
    private attachLocalAuthoritativeInputs() {
      this.detachLocalAuthoritativeInputs();
    
      this.localKeysHandler = (e: KeyboardEvent) => {
        const code = e.code;
        if (!this.isMovementKey(code)) return; // ne gère QUE mouvements
        e.preventDefault();
        const isDown = e.type === 'keydown';
        this.online?.sendKey(code, isDown);
      };
    
      window.addEventListener('keydown', this.localKeysHandler, { passive: false });
      window.addEventListener('keyup', this.localKeysHandler, { passive: false });
    
    }
    
    private detachLocalAuthoritativeInputs() {
      if (this.localKeysHandler) {
        window.removeEventListener('keydown', this.localKeysHandler);
        window.removeEventListener('keyup', this.localKeysHandler);
        this.localKeysHandler = undefined;
      }
    }

  public dispose() {
    this.detachLocalAuthoritativeInputs();
    window.removeEventListener('keydown', this.keyDownHandler as any);
    window.removeEventListener('keyup', this.keyUpHandler as any);
    this.online?.dispose();
    this.online = null;
    this.tournament = null;
    
    if (this.renderer)
      this.renderer.clearRender();
    }
}
