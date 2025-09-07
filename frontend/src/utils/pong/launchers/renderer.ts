import type { GameState } from '../../../../shared/engine_play/src/types';
import { GameLogic } from '../../../../shared/engine_play/src/game_logic';

export class GameRenderer {
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
	  ctx.fillText(`Winner : ${state.tracker?.winner?.name ?? '—'}`, centerX, y);
	  y += 40;
	  ctx.fillText(`Total exchanges : ${state.tracker?.totalExchanges ?? 0}`, centerX, y);
	  y += 30;
	  ctx.fillText(`Longest exchange : ${state.tracker?.maxRally ?? 0}`, centerX, y);
	  ctx.fillText('Press [Space] to continue', centerX, (y + 150));
	}
  
	public clearRender()
	{
	  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	  // this.ctx.fillText('Matchmaking...', (this.canvas.width / 2), (this.canvas.height / 2));
	}
  
  // Dans GameRenderer
  drawMessage(
	text: string,
	opts: { x?: number; y?: number; lineHeight?: number; align?: CanvasTextAlign } = {}
  ) {
	const ctx = this.ctx;
	const { width, height } = this.canvas;
  
	const lines = String(text).split(/\r?\n/);           // ← gère \n
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
	  this.isStarting(state.ball.height, state.ball.width ,state.ball.x, state.ball.y, state.tracker.totalExchanges, state.scores);
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
		  this.ctx.fillText(paddle.name.substring(0, 10), x, paddle.y - 15);
		});
	  }
  
	  
	  // score
	  this.ctx.font = "30px Arial";
	  this.ctx.textAlign = "center";
	  this.ctx.fillText(`${state.scores.A}    ${state.scores.B}`, this.canvas.width / 2, 40);
	}
	isStarting(BallH: number, BallW: number, BallX: number, BallY: number, echanges: number, score: {A: number, B: number})
	{
	  let scores_echanges = score.A + score.B + echanges;
	  let ball = ((this.canvas.height/2) - BallH/2) + ((this.canvas.width/2) - BallW/2) ;
	  if (ball && scores_echanges == 0)
	  {
		this.startTime = performance.now();
	  }
	}
  }