import Fastify from 'fastify';
import WebSocket, { WebSocketServer } from 'ws';

const app = Fastify();
const server = app.server; // ← récupère le serveur Node intégré à Fastify

const wss = new WebSocketServer({ server });

// === Typage minimal pour ton joueur ===
interface Player {
  ws: WebSocket;
  role: 'left' | 'right';
}

type Role = 'left' | 'right';

interface Game {
  id: number;
  players: { [key in Role]?: Player };
  state: StateOnline;
  interval?: NodeJS.Timeout;
  paused: boolean;
}

let games: Game[] = [];
let nextGameId = 1;

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

// === Fonctions de jeu ===

function resetBall(state: StateOnline) {
  state.ball.x = 400;
  state.ball.y = 300;
  state.ball.dx = Math.random() < 0.5 ? 4 : -4;
  state.ball.dy = Math.random() < 0.5 ? 4 : -4;
}

function startCountdown(game: Game, callback: () => void) {
  let countdown = 3;
  game.state.countdownText = countdown.toString();
  game.paused = true;
  broadcastState(game);

  const interval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      game.state.countdownText = countdown.toString();
    } else if (countdown === 0) {
      game.state.countdownText = 'GO!';
    } else {
      game.state.countdownText = null;
      game.paused = false;
      clearInterval(interval);
      callback();
    }
    broadcastState(game);
  }, 1000);
}


function updateGame(game: Game) {
  if (game.paused) return;
  const b = game.state.ball;
  const p = game.state.paddles;
  const s = game.state.score;

  p.left.y += p.left.dy;
  p.right.y += p.right.dy;
  p.left.y = Math.max(0, Math.min(500, p.left.y));
  p.right.y = Math.max(0, Math.min(500, p.right.y));

  b.x += b.dx;
  b.y += b.dy;

  if (b.y <= 0 || b.y >= 600) b.dy *= -1;

  if ((b.x - b.radius < 20 && b.y > p.left.y && b.y < p.left.y + 100) ||
      (b.x + b.radius > 780 && b.y > p.right.y && b.y < p.right.y + 100)) {
    b.dx *= -1.05;
    b.dy *= 1.05;
  }

  if (b.x < 0) {
    s.right++;
    if (s.right === 3) finishOnlineGame(game, '🅿️ Droite a gagné !');
    else {
      resetBall(game.state);
      startCountdown(game, () => {});
    }
  } else if (b.x > 800) {
    s.left++;
    if (s.left === 3) finishOnlineGame(game, '🅿️ Gauche a gagné !');
    else {
      resetBall(game.state);
      startCountdown(game, () => {});
    }
  }

  broadcastState(game);
}

function broadcastState(game: Game) {
  const msg = JSON.stringify({ type: 'state', state: game.state });
  for (const role of ['left', 'right'] as const) {
    const player = game.players[role];
    if (player?.ws.readyState === WebSocket.OPEN) {
      player.ws.send(msg);
    }
  }
}

function finishOnlineGame(game: Game, winnerText: string) {
  game.paused = true;
  game.state.countdownText = winnerText;
  broadcastState(game);

  setTimeout(() => {
    game.state.score.left = 0;
    game.state.score.right = 0;
    resetBall(game.state);
    startCountdown(game, () => {
      game.paused = false;
    });
  }, 5000);
}


function finishOnlineGameByForfeit(game: Game, winnerText: string) {
  game.paused = true;
  game.state.countdownText = winnerText;
  broadcastState(game);

  const msg = JSON.stringify({ type: 'forfeit', message: winnerText });
  for (const role of ['left', 'right'] as const) {
    const player = game.players[role];
    if (player?.ws.readyState === WebSocket.OPEN) {
      player.ws.send(msg);
    }
  }

  setTimeout(() => {
    game.state.score.left = 0;
    game.state.score.right = 0;
    resetBall(game.state);
    game.state.countdownText = null;
    broadcastState(game);
  }, 5000);
}


function createNewGame(): Game {
  const state: StateOnline = {
    ball: { x: 400, y: 300, dx: 0, dy: 0, radius: 8 },
    paddles: {
      left: { y: 250, dy: 0 },
      right: { y: 250, dy: 0 },
    },
    score: { left: 0, right: 0 },
    countdownText: null
  };

  const game: Game = {
    id: nextGameId++,
    players: {},
    state,
    paused: true
  };

  games.push(game);
  return game;
}


// === Gestion des connexions WS ===

wss.on('connection', (ws: WebSocket) => {
  let assigned = false;

  // Nettoie les parties avec 0 joueur (au cas où)
games = games.filter(game => game.players.left || game.players.right);
  for (const game of games) {
    if (!game.players.left) {
      game.players.left = { ws, role: 'left' };
      ws.send(JSON.stringify({ type: 'role', role: 'left', gameId: game.id }));
      assigned = true;
    } else if (!game.players.right) {
      game.players.right = { ws, role: 'right' };
      ws.send(JSON.stringify({ type: 'role', role: 'right', gameId: game.id }));
      assigned = true;

      resetBall(game.state);
      startCountdown(game, () => {
        game.paused = false;
        game.interval = setInterval(() => updateGame(game), 1000 / 60);
      });
    }

    if (assigned) {
      setupGameCommunication(ws, game);
      return;
    }
  }

  // Si aucun slot libre, on crée un nouveau jeu
  const newGame = createNewGame();
  newGame.players.left = { ws, role: 'left' };
  ws.send(JSON.stringify({ type: 'role', role: 'left', gameId: newGame.id }));
  setupGameCommunication(ws, newGame);
});

function setupGameCommunication(ws: WebSocket, game: Game) {
  ws.on('message', msg => {
    const data = JSON.parse(msg.toString());
    if (data.type === 'paddleMove') {
      game.state.paddles[data.role as Role].dy = data.dy;
    }
  });

  ws.on('close', () => {
    if (game.interval) clearInterval(game.interval);
    finishOnlineGameByForfeit(game, `🅿️ ${game.players.left?.ws === ws ? 'Gauche' : 'Droite'} a quitté la partie`);
    // Supprime la game de la liste globale
games = games.filter(g => g !== game);
  });
}


// === Lancement ===
server.listen(3002, '0.0.0.0', () => {
  console.log('🚀 WebSocket server running on http://0.0.0.0:3002');
});
