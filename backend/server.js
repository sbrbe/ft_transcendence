const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

let players = [];
let readyPlayers = 0;
let gameIntervalOnline = null;
let gamePausedOnline = true;

let stateOnline = {
  ball: { x: 400, y: 300, dx: 0, dy: 0, radius: 8 },
  paddles: {
    left: { y: 250, dy: 0 },
    right: { y: 250, dy: 0 }
  },
  score: { left: 0, right: 0 },
  countdownText: null
};

function resetBall(state) {
  state.ball.x = 400;
  state.ball.y = 300;
  state.ball.dx = Math.random() < 0.5 ? 4 : -4;
  state.ball.dy = Math.random() < 0.5 ? 4 : -4;
}

function startCountdown(state, callback) {
  let countdown = 3;
  state.countdownText = countdown.toString();
  gamePausedOnline = true;
  broadcastState();

  const interval = setInterval(() => {
    countdown--;
    if (countdown > 0) state.countdownText = countdown.toString();
    else if (countdown === 0) state.countdownText = "GO!";
    else {
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
  const { ball: b, paddles: p, score } = stateOnline;

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
    score.right++;
    if (score.right === 3) {
      finishOnlineGame("🅿️ Droite a gagné !");
    } else {
      resetBall(stateOnline);
      startCountdown(stateOnline, () => {});
    }
  } else if (b.x > 800) {
    score.left++;
    if (score.left === 3) {
      finishOnlineGame("🅿️ Gauche a gagné !");
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

wss.on('connection', ws => {
  if (players.length >= 2) {
    ws.close();
    return;
  }

  const role = players.length === 0 ? 'left' : 'right';
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

  ws.on('message', msg => {
    const data = JSON.parse(msg);
    if (data.type === 'paddleMove') {
      stateOnline.paddles[data.role].dy = data.dy;
    }
    if (data.type === 'forfeit') {
      console.log("💡 Victoire par forfait reçue :", data.message);
      gamePausedOnline = true;
      gameWinnerText = data.message;
    
      // On freeze visuellement la partie
      setTimeout(() => {
        // Nettoyage visuel et état
        gameWinnerText = null;
        stateOnline.score.left = 0;
        stateOnline.score.right = 0;
        stateOnline.ball = { x: 400, y: 300, radius: 8 };
        stateOnline.paddles.left.y = 250;
        stateOnline.paddles.right.y = 250;
        showView('view-home');
        displayMessage(""); // reset du message d’attente
      }, 5000);

  finishOnlineGameByForfeit(gameWinnerText);
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
    
      const remainingPlayer = players[0]; // Celui qui est encore connecté
      const winner = remainingPlayer?.role === 'left' ? "🅿️ Gauche a gagné par forfait !" : "🅿️ Droite a gagné par forfait !";
  console.log("🏁 Envoi message de forfait au joueur restant :", winner);

      finishOnlineGameByForfeit(winner);
    }    
  });
});

console.log('✅ WebSocket server running on port 3000');


function finishOnlineGame(winnerText) {
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

function finishOnlineGameByForfeit(winnerText) {
  gamePausedOnline = true;
  stateOnline.countdownText = winnerText;

  broadcastState();

  // Envoie un message spécial aux clients pour retour à l'accueil
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
