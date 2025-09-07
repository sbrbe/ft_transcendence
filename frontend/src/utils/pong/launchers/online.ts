import { OnlineClient } from './onlineClient';
import { GameRenderer } from './renderer'
import { contender } from "../../../../shared/engine_play/src/types";
import type { Disposable } from "./runtime";

export class GameOnline implements Disposable{
	private btnUp: HTMLButtonElement | null;
	private btnDown: HTMLButtonElement | null;
	private betweenStage: 'idle' | 'winner' |'next' | 'end' | 'endOln'  = 'idle';
	private canvas: HTMLCanvasElement;
	private renderer: GameRenderer;
	// en haut de la classe
  private online: OnlineClient | null = null;
  private mobileTouchAttached = false;



  constructor(userName: string, playerId: string) {
	this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	this.renderer = new GameRenderer(this.canvas);
	const playerInfo: contender = {
		id: playerId,
		name: userName
	  };
	this.startOnline(playerInfo);
	// Boutons mobile (assure-toi que ces IDs existent dans ton HTML)
	this.btnUp = document.getElementById('btn-up') as HTMLButtonElement | null;
	this.btnDown = document.getElementById('btn-down') as HTMLButtonElement | null;
  }
  
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
	
	private keyDownHandler = (e: KeyboardEvent) => {
	  const code = e.code;
	  
	  if (code === 'Space') {
		if (this.betweenStage === 'winner') {
		  e.preventDefault();
		  this.betweenStage = 'idle';
		  return;
		}
		if (this.betweenStage === 'endOln') {
		  e.preventDefault();
		  this.betweenStage = 'idle';
		  window.location.href = "/#/home";
		  return;
		}
	  }
	  
	  // Empêche le scroll avec les flèches
	  if (code === 'ArrowUp' || code === 'ArrowDown') e.preventDefault();
	  
	  if (this.online) {
		if (code === 'ArrowUp' || code === 'ArrowDown') {
		  e.preventDefault();
		  this.online.sendKey(code, true);
		  return;
		}
	  }
	};
	
	private keyUpHandler = (e: KeyboardEvent) => {
	  const code = e.code;
	  
	  // Espace “between stages” (tournoi)
	  if (code === 'Space' && (this.betweenStage === 'winner')) {
		e.preventDefault();
		return;
	  }
	  
	  if (code === 'ArrowUp' || code === 'ArrowDown') e.preventDefault();
	  
	  if (this.online) {
		if (code === 'ArrowUp' || code === 'ArrowDown' || code === 'KeyW' || code === 'KeyS') {
		  e.preventDefault();
		  this.online.sendKey(code, false);
		  return;
		}
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
	
  
  
	private startOnline(playerInfo: contender) {
	  // client WS
	  this.online?.dispose();
	  this.online = new OnlineClient(
		// onState
		(snap) => {
		  if (!this.renderer) return;
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
		  }
		},
	'/game'
	  );
	  this.online.connect().then(() => {
				this.online!.sendConf1vs1(playerInfo);
		  });
	  this.attachInputListeners();
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

	dispose()
  {
    this.detachInputListeners();
	this.online?.dispose();
    this.online = null;
    window.removeEventListener('keydown', this.keyDownHandler as any);
    window.removeEventListener('keyup', this.keyUpHandler as any);

    if (this.renderer)
      this.renderer.clearRender();
  }
}