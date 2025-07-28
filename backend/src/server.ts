import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

// === Création du serveur HTTP (pas de routes HTTP classiques ici) ===
const server = http.createServer();

// === Serveur WebSocket attaché ===
const wss = new WebSocketServer({ server });

// === Typage minimal pour ton joueur ===
interface Player {
  ws: WebSocket;
  role: 'left' | 'right';
}

let players: Player[] = [];
let readyPlayers = 0;
let gameIntervalOnline: NodeJS.Timeout | null = null;
let gamePausedOnline = true;

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Paddle {
  y: number;
  dy: number;
}

interface StateOnline {
  ball: Ball;
  paddles: {
    left: Paddle;
    right: Paddle;
  };
  score: {
    left: number;
    right: number;
  };
  countdownText: string | null;
}

let stateOnline: StateOnline = {
  ball: { x: 400, y: 300, dx: 0, dy: 0, radius: 8 },
  paddles: {
    left: { y: 250, dy: 0 },
    right: { y: 250, dy: 0 },
  },
  score: { left: 0, right: 0 },
  countdownText: null,
};

// === Fonctions de jeu ===

function resetBall(state: StateOnline) {
  state.ball.x = 400;
  state.ball.y = 300;
  state.ball.dx = Math.random() < 0.5 ? 4 : -4;
  state.ball.dy = Math.random() < 0.5 ? 4 : -4;
}

function startCountdown(state: StateOnline, callback: () => void) {
  let countdown = 3;
  state.countdownText = countdown.toString();
  gamePausedOnline = true;
  broadcastState();

  const interval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      state.countdownText = countdown.toString();
    } else if (countdown === 0) {
      state.countdownText = 'GO!';
    } else {
      state.countdownText = null;
      gamePausedOnline = false;
      clearInterval(interval);
      callback();
    }
    broadcastState();
  }, 1000);
}

function updateGame() {
  if (gamePausedOnline) return;

  const b = stateOnline.ball;
  const p = stateOnline.paddles;
  const score = stateOnline.score;

  p.left.y += p.left.dy;
  p.right.y += p.right.dy;
  p.left.y = Math.max(0, Math.min(500, p.left.y));
  p.right.y = Math.max(0, Math.min(500, p.right.y));

  b.x += b.dx;
  b.y += b.dy;

  if (b.y <= 0 || b.y >= 600) b.dy *= -1;

  if (
    (b.x - b.radius < 20 && b.y > p.left.y && b.y < p.left.y + 100) ||
    (b.x + b.radius > 780 && b.y > p.right.y && b.y < p.right.y + 100)
  ) {
    b.dx *= -1.05;
    b.dy *= 1.05;
  }

  if (b.x < 0) {
    score.right++;
    if (score.right === 3) {
      finishOnlineGame('🅿️ Droite a gagné !');
    } else {
      resetBall(stateOnline);
      startCountdown(stateOnline, () => {});
    }
  } else if (b.x > 800) {
    score.left++;
    if (score.left === 3) {
      finishOnlineGame('🅿️ Gauche a gagné !');
    } else {
      resetBall(stateOnline);
      startCountdown(stateOnline, () => {});
    }
  }

  broadcastState();
}

function broadcastState() {
  const msg = JSON.stringify({ type: 'state', state: stateOnline });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

function finishOnlineGame(winnerText: string) {
  gamePausedOnline = true;
  stateOnline.countdownText = winnerText;
  broadcastState();

  setTimeout(() => {
    stateOnline.score.left = 0;
    stateOnline.score.right = 0;
    resetBall(stateOnline);
    startCountdown(stateOnline, () => {
      gamePausedOnline = false;
    });
  }, 5000);
}

function finishOnlineGameByForfeit(winnerText: string) {
  gamePausedOnline = true;
  stateOnline.countdownText = winnerText;
  broadcastState();

  const msg = JSON.stringify({ type: 'forfeit', message: winnerText });
  for (const player of players) {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(msg);
    }
  }

  setTimeout(() => {
    stateOnline.score.left = 0;
    stateOnline.score.right = 0;
    resetBall(stateOnline);
    stateOnline.countdownText = null;
    broadcastState();
  }, 5000);
}

// === Gestion des connexions WS ===

wss.on('connection', (ws: WebSocket) => {
  if (players.length >= 2) {
    ws.close();
    return;
  }

  const role: 'left' | 'right' = players.length === 0 ? 'left' : 'right';
  players.push({ ws, role });
  ws.send(JSON.stringify({ type: 'role', role }));
  readyPlayers++;

  if (readyPlayers === 2) {
    resetBall(stateOnline);
    startCountdown(stateOnline, () => {
      if (!gameIntervalOnline) {
        gameIntervalOnline = setInterval(updateGame, 1000 / 60);
      }
    });
  }

  ws.on('message', (msg: WebSocket.RawData) => {
    const data = JSON.parse(msg.toString()) as any;
    if (data.type === 'paddleMove') {
      const role = data.role as 'left' | 'right';
      stateOnline.paddles[role].dy = data.dy;
    }
    if (data.type === 'forfeit') {
      console.log('💡 Victoire par forfait reçue :', data.message);
      gamePausedOnline = true;
      finishOnlineGameByForfeit(data.message);
    }
  });

  ws.on('close', () => {
    players = players.filter(p => p.ws !== ws);
    readyPlayers = players.length;
    if (readyPlayers < 2) {
      if (gameIntervalOnline) {
        clearInterval(gameIntervalOnline);
        gameIntervalOnline = null;
      }

      const remainingPlayer = players[0];
      const winner =
        remainingPlayer?.role === 'left'
          ? '🅿️ Gauche a gagné par forfait !'
          : '🅿️ Droite a gagné par forfait !';

      console.log('🏁 Envoi message de forfait au joueur restant :', winner);
      finishOnlineGameByForfeit(winner);
    }
  });
});

// === Lancement ===
server.listen(3002, '0.0.0.0', () => {
  console.log('🚀 WebSocket server running on http://0.0.0.0:3002');
});
