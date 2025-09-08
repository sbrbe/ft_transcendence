import type { GameState } from '../../../../shared/engine_play/src/types';
import { GameLogic } from '../../../../shared/engine_play/src/game_logic';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private startTime: number;

  // --- Bump score animation ---
  private prevScore = { A: 0, B: 0 };
  private bumpStart: { A: number | null; B: number | null } = { A: null, B: null };
  private readonly bumpDuration = 300; // ms
  private readonly baseFontPx = 30;
  private readonly bumpExtraPx = 12;  // +px pendant l’anim

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

  public clearRender() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Multi-lignes centrées
  drawMessage(
    text: string,
    opts: { x?: number; y?: number; lineHeight?: number; align?: CanvasTextAlign } = {}
  ) {
    const ctx = this.ctx;
    const { width, height } = this.canvas;

    const lines = String(text).split(/\r?\n/);
    const lineHeight = opts.lineHeight ?? 24;

    ctx.save();
    ctx.textAlign = opts.align ?? 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '30px sans-serif';
    ctx.fillStyle = 'white';

    const x = opts.x ?? width / 2;
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

    const exchanges = state.tracker?.totalExchanges ?? 0;
this.isStarting(
  state.ball.height,
  state.ball.width,
  state.ball.x,
  state.ball.y,
  exchanges,
  state.scores
);

    // Noms au lancement (3s)
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

    // --- Score avec bump animé ---
    this.drawScore(state.scores);
  }

  // Détecte le départ d’anim et dessine chaque côté séparément
  private drawScore(scores: { A: number; B: number }, animate = true) {
    const now = performance.now();
  
    const isReset =
      (scores.A === 0 && scores.B === 0 && (this.prevScore.A !== 0 || this.prevScore.B !== 0)) ||
      (scores.A < this.prevScore.A) ||
      (scores.B < this.prevScore.B);
  
    if (isReset || !animate) {
      this.prevScore = { ...scores };
      this.bumpStart = { A: null, B: null };
    } else {
      if (scores.A > this.prevScore.A) {
        this.bumpStart.A = now;
        this.prevScore.A = scores.A;
      }
      if (scores.B > this.prevScore.B) {
        this.bumpStart.B = now;
        this.prevScore.B = scores.B;
      }
    }
  
    const fontA = this.computeBumpFont(now, this.bumpStart.A);
    const fontB = this.computeBumpFont(now, this.bumpStart.B);
  
    const gap = 36;
    const centerX = this.canvas.width / 2;
    const y = 40;
  
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = 'white';
    this.ctx.font = `${fontA}px Arial`;
    this.ctx.fillText(String(scores.A), centerX - gap, y);
  
    this.ctx.textAlign = 'left';
    this.ctx.font = `${fontB}px Arial`;
    this.ctx.fillText(String(scores.B), centerX + gap, y);
  }
  

  // Courbe d’anim ease-out (0→1)
  private easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  // Taille de police animée (retour à la base après la durée)
  private computeBumpFont(now: number, startedAt: number | null) {
    if (startedAt == null) return this.baseFontPx;
    const t = (now - startedAt) / this.bumpDuration;
    if (t >= 1) return this.baseFontPx;
    const k = this.easeOutCubic(t);
    return this.baseFontPx + this.bumpExtraPx * (1 - Math.abs(2 * t - 1)); // petit aller-retour
  }

  isStarting(
    BallH: number,
    BallW: number,
    BallX: number,
    BallY: number,
    echanges: number,
    score: { A: number; B: number }
  ) {
    const scores_echanges = score.A + score.B + echanges;
  
    const cx = this.canvas.width / 2 - BallW / 2;
    const cy = this.canvas.height / 2 - BallH / 2;
    const eps = 0.5;
  
    const ballIsCentered = Math.abs(BallX - cx) <= eps && Math.abs(BallY - cy) <= eps;
  
    if (ballIsCentered && scores_echanges === 0) {
      this.startTime = performance.now();
      this.bumpStart = { A: null, B: null };
      this.prevScore = { ...score };
    }
  }
  
}
