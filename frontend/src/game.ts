import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
import { Player } from './player.js';
import { CPU } from './CPU.js';
import { Tracker } from './tracker.js';


type playerType = "human" | "cpu" | null;
type gameMode = "1v1" | "2v2" | "CPU" | "tournament";

interface gameConfig {
  mode: gameMode;
  playerSetup?: playerType[];
}



export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  ball: Ball;
// en haut de Game
players: (Player | null)[] = [];
ais: (CPU | null)[] = []; // <— nouveau
paddles: (Paddle | null)[] = [];
  scoreA : number = 0;
  scoreB : number = 0;
  running : boolean = true;
  private tracker = new Tracker();
  private config: gameConfig
  private rafId: number | null = null;
  private destroyed = false;

  public quitToMenu() {
    this.teardown(true);
  }

  //pass cpu mode on app.ts
  constructor(canvas: HTMLCanvasElement, conf: gameConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Contexte 2D non trouvé.");
    this.ctx = ctx;
    this.config = conf;  
    this.ball = new Ball(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 80,
      canvas.width / 80,
      'white',
      'right'
    );
    this.initPlayers();
    this.ball.spawn();
  }

    private initPlayers() {
    const paddleWidth = this.canvas.width / 80;
    const paddleHeight = this.canvas.height / 12;
    const margin = 5;
    const spacing = 30;
    const y = (this.canvas.height - paddleHeight) / 2;

    const positions = [
      { x: margin, y },
      { x: this.canvas.width - margin - paddleWidth, y },
      { x: margin * 2 + paddleWidth, y: y + spacing },
      { x: this.canvas.width - (margin * 4  + paddleWidth), y: y + spacing }
    ];

    const controls = [
      { up: 'z', down: 's' },
      { up: 'ArrowUp', down: 'ArrowDown' },
      { up: 'e', down: 'd' },
      { up: 'i', down: 'k' }
    ];

    let playerTypes: playerType[];

    switch (this.config.mode) {
      case "1v1":
        playerTypes = this.config.playerSetup ?? ["human", "human"];
        break;

      case "2v2":
        playerTypes = this.config.playerSetup ?? ["cpu", "cpu", "cpu", "cpu"];
        break;
      /*case "tournament":
        playerTypes = []; // à implémenter
        break;*/
      default:
        playerTypes = ["human", 'human'];
    }

    for (let i = 0; i < 4; i++) {
      const type = playerTypes[i] ?? null;

      if (type === null) {
        this.players.push(null);
        this.ais.push(null);
        this.paddles.push(null);
        continue;
      }

      const paddle = new Paddle(
        positions[i].x,
        positions[i].y,
        paddleWidth,
        paddleHeight,
        'white',
        15
      );

      this.paddles.push(paddle);
      // ... à la place de: new CPU(paddle)
      if (type === "human") {
        // n’accepte que les vraies touches
        this.players.push(new Player(paddle, controls[i], { source: 'human' }));
        this.ais.push(null);
      } else {
        // IA : Player “faux humain” qui n’accepte que les touches synthétiques
        this.players.push(new Player(paddle, controls[i], { source: 'synthetic' }));
        this.ais.push(new CPU(paddle, controls[i])); // qui dispatch KeyboardEvent (isTrusted=false)
      }
      

    }
  }

  private teardown(showMenu = true) {
    // Stopper toute animation
    this.destroyed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.running = false;

    // Relâcher/éteindre IA + débrancher les joueurs (clavier)
    this.ais.forEach(cpu => cpu?.release());          // stop inputs + clear timers dans CPU
    this.players.forEach(p => (p as any)?.destroy?.()); // retire les event listeners dans Player

    // Vider les références pour éviter fuites/mélanges
    this.players.length = 0;
    this.ais.length = 0;
    this.paddles.length = 0;

    // Reset visuel (hard reset du contexte)
    const w = this.canvas.width, h = this.canvas.height;
    this.ctx.setLineDash([]);
    this.ctx.clearRect(0, 0, w, h);
    this.canvas.width = w; // réinitialise le contexte 2D

    // Reset du tracker
    this.tracker = new Tracker();

    // Retour menu si besoin
    if (showMenu) {
      const menu = document.getElementById("menu");
      if (menu) menu.style.display = "block";
    }
  }

  drawDashedLine(pattern: number[]) {
    this.ctx.strokeStyle = 'white';
    this.ctx.setLineDash(pattern);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
  }
  isEnd() : boolean
  {
    if ((this.scoreA >= 11 ||this.scoreB >= 11) && 
      Math.abs(this.scoreA - this.scoreB) > 2
    )
    {
      if (this.scoreA > this.scoreB)
        this.tracker.setWinner("Team 1");
      else
        this.tracker.setWinner("Team 2");
      this.running = false ;
      return true;
    }
    return false
  }

  update() {
   // 1) IA simule les keydown/keyup
   this.ais.forEach((cpu, i) => {
    if (cpu && this.paddles[i]) cpu.update(this.ball, this.canvas.height);
  });

  // 2) Les Player (humains *et* “movers” des IA) appliquent le mouvement
  this.players.forEach((player, i) => {
    if (player && this.paddles[i]) player.update(this.ball, this.canvas.height);
  });
    
    const activePaddles = this.paddles.filter(p => p !== null) as Paddle[];
    this.ball.colisionMultiple(activePaddles, this.canvas.height, this.tracker);
    this.ball.update();
    if (this.ball.goal(this.canvas.width)) {
      this.ais.forEach(cpu => { cpu?.release(); cpu?.resetTime(); }); // <— important
    
      if (this.ball.x <= 0) this.scoreB++; else this.scoreA++;
      this.tracker.resetExchange();
      if (this.isEnd()) return;
    
      this.ball.x = this.canvas.width / 2;
      this.ball.y = ((this.scoreA + this.scoreB) % 2 === 0)
        ? this.canvas.height - this.canvas.height / 4
        : this.canvas.height / 4;
      this.ball.spawn();
    }
    
  }

  draw() {
    console.log("onDessine");
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.font = '48px Arial';

    this.drawDashedLine([10, 10]);
    this.ctx.fillText(this.scoreA.toString(), this.canvas.width / 4, 90);
    this.ctx.fillText(this.scoreB.toString(), (this.canvas.width * 3) / 4, 90);

    this.paddles.forEach(p => {
      if (p) p.draw(this.ctx);
    });

    this.ball.draw(this.ctx);
  }


  loop = () => {
    if (this.destroyed) return;
    this.update();
    this.draw();
    if (this.running) {
      this.rafId = requestAnimationFrame(this.loop);
    } else {
      this.endGame();
    }
  };

  endScreen(stats :{ winner: string | null;
  totalExchanges: number;
  maxRally: number;})
    : void {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';

    const centerX = this.canvas.width / 2;
    let y = this.canvas.height / 2 - 60;

    ctx.fillText(`🏆 Gagnant : ${stats.winner}`, centerX, y);
    y += 40;
    ctx.fillText(`Total échanges : ${stats.totalExchanges}`, centerX, y);
    y += 30;
    ctx.fillText(`Rallye max : ${stats.maxRally}`, centerX, y);
    
  }

  endGame() {
    // Affiche l’écran de fin UNE frame, puis cleanup
    const stats = this.tracker.getStats();
    this.endScreen(stats);
    requestAnimationFrame(() => this.teardown(true));
  }
  
  start() {
    this.loop();
  }
}
