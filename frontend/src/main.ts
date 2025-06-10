const socket = new WebSocket(`ws://${window.location.hostname}:3000`);
let role: 'left' | 'right' = 'left';
let isLocalMode = false;
let gamePausedLocal = true;
let gamePausedOnline = true;
let gameWinnerText: string | null = null;

let stateOnline = {
  paddles: {
    left: { y: 250, dy: 0 },
    right: { y: 250, dy: 0 }
  },
  ball: { x: 400, y: 300, radius: 8 },
  score: { left: 0, right: 0 },
  countdownText: null as string | null
};

let stateLocal = {
  paddles: {
    left: { y: 250, dy: 0 },
    right: { y: 250, dy: 0 }
  },
  ball: { x: 400, y: 300, radius: 8, dx: 0, dy: 0 },
  score: { left: 0, right: 0 },
  countdownText: null as string | null
};

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const messageBox = document.getElementById("messageBox");

function showView(viewId: string) {
  ['view-home', 'view-game', 'view-register'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === viewId ? 'block' : 'none';
  });
}

function displayMessage(msg: string) {
  if (messageBox) messageBox.textContent = msg;
}

document.getElementById('nav-home')?.addEventListener('click', () => {
  isLocalMode = false;
  gamePausedLocal = true;
  gamePausedOnline = true;
  gameWinnerText = null;

  // Réinitialise les états locaux
  stateLocal = {
    paddles: {
      left: { y: 250, dy: 0 },
      right: { y: 250, dy: 0 }
    },
    ball: { x: 400, y: 300, dx: 0, dy: 0, radius: 8 },
    score: { left: 0, right: 0 },
    countdownText: null
  };

  // Réinitialise les états en ligne
  stateOnline = {
    paddles: {
      left: { y: 250, dy: 0 },
      right: { y: 250, dy: 0 }
    },
    ball: { x: 400, y: 300, radius: 8 },
    score: { left: 0, right: 0 },
    countdownText: null
  };

  // Ferme proprement le WebSocket
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'forfeit' }));
  }  
  // Nettoie l'affichage et revient à l'accueil
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  displayMessage("");
  showView('view-home');
});


document.getElementById('nav-game')?.addEventListener('click', () => {
  isLocalMode = true;
  gamePausedOnline = true;
  resetLocalGame();
  showView('view-game');
  history.pushState(null, '', '/game');
  displayMessage("🎮 Jeu local (2 joueurs sur 1 clavier)");
  startCountdownLocal(() => gamePausedLocal = false);
});

document.getElementById('nav-game-online')?.addEventListener('click', () => {
  isLocalMode = false;
  gamePausedLocal = true;
  showView('view-game');
  history.pushState(null, '', '/game');
  displayMessage("🕓 En attente d’un autre joueur...");
  socket.send(JSON.stringify({ type: 'ready' }));
});

function resetLocalGame() {
  stateLocal.ball = {
    x: 400,
    y: 300,
    dx: Math.random() < 0.5 ? 4 : -4,
    dy: Math.random() < 0.5 ? 4 : -4,
    radius: 8
  };
  stateLocal.paddles.left.y = 250;
  stateLocal.paddles.right.y = 250;
  stateLocal.paddles.left.dy = 0;
  stateLocal.paddles.right.dy = 0;
  gamePausedLocal = true;
}

function startCountdownLocal(callback: () => void) {
  let count = 3;
  stateLocal.countdownText = count.toString();
  const interval = setInterval(() => {
    count--;
    if (count > 0) stateLocal.countdownText = count.toString();
    else if (count === 0) stateLocal.countdownText = "GO!";
    else {
      stateLocal.countdownText = null;
      clearInterval(interval);
      callback();
    }
  }, 1000);
}

document.addEventListener("keydown", e => {
  const state = isLocalMode ? stateLocal : stateOnline;
  const isLeftKey = e.key === 'z' || e.key === 's';
  const isRightKey = e.key === 'ArrowUp' || e.key === 'ArrowDown';
  const dy = (e.key === 'z' || e.key === 'ArrowUp') ? -5 : 5;

  if (isLocalMode) {
    if (isLeftKey) stateLocal.paddles.left.dy = dy;
    if (isRightKey) stateLocal.paddles.right.dy = dy;
  } else {
    // En ligne : uniquement les flèches
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const playerRole = role; // "left" ou "right"
      socket.send(JSON.stringify({ type: 'paddleMove', role: playerRole, dy }));
    }
  }
});


document.addEventListener("keyup", e => {
  const state = isLocalMode ? stateLocal : stateOnline;
  const isLeftKey = e.key === 'z' || e.key === 's';
  const isRightKey = e.key === 'ArrowUp' || e.key === 'ArrowDown';

  if (isLocalMode) {
    if (isLeftKey) stateLocal.paddles.left.dy = 0;
    if (isRightKey) stateLocal.paddles.right.dy = 0;
  } else {
    // En ligne : uniquement les flèches
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const playerRole = role;
      socket.send(JSON.stringify({ type: 'paddleMove', role: playerRole, dy: 0 }));
    }
  }
});


function updateLocalGame() {
  if (!isLocalMode || gamePausedLocal) return;
  const b = stateLocal.ball;
  const p = stateLocal.paddles;
  b.x += b.dx;
  b.y += b.dy;
  p.left.y += p.left.dy;
  p.right.y += p.right.dy;
  p.left.y = Math.max(0, Math.min(500, p.left.y));
  p.right.y = Math.max(0, Math.min(500, p.right.y));
  if (b.y <= 0 || b.y >= 600) b.dy *= -1;
  if ((b.x - b.radius < 20 && b.y > p.left.y && b.y < p.left.y + 100) ||
    (b.x + b.radius > 780 && b.y > p.right.y && b.y < p.right.y + 100)) {
  b.dx *= -1.05; // accélère légèrement à chaque rebond
  b.dy *= 1.05;
  }
  if (b.x < 0) {
    stateLocal.score.right++;
    if (stateLocal.score.right === 3) {
      finishGame("🅿️ Droite a gagné !");
    } else {
      resetLocalGame();
      startCountdownLocal(() => gamePausedLocal = false);
    }
  } else if (b.x > 800) {
    stateLocal.score.left++;
    if (stateLocal.score.left === 3) {
      finishGame("🅿️ Gauche a gagné !");
    } else {
      resetLocalGame();
      startCountdownLocal(() => gamePausedLocal = false);
    }
  }  
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const s = isLocalMode ? stateLocal : stateOnline;
  const b = isLocalMode ? stateLocal.ball : stateOnline.ball;
  ctx.fillStyle = "#000";
  ctx.font = "24px Arial";
  ctx.fillText(s.score.left.toString(), canvas.width / 4, 30);
  ctx.fillText(s.score.right.toString(), (canvas.width * 3) / 4, 30);
  ctx.fillRect(10, s.paddles.left.y, 10, 100);
  ctx.fillRect(780, s.paddles.right.y, 10, 100);
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
  if (s.countdownText) {
    ctx.font = "72px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000";
    ctx.fillText(s.countdownText, canvas.width / 2, canvas.height / 2);
  }
  if (gameWinnerText) {
    ctx.font = "72px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000";
    ctx.fillText(gameWinnerText, canvas.width / 2, canvas.height / 2);
  }
}

function renderLoop() {
  updateLocalGame();
  draw();
  requestAnimationFrame(renderLoop);
}
renderLoop();

socket.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  if (data.type === 'role') {
    role = data.role;
    displayMessage(`🎮 Connecté en tant que ${role === 'left' ? '🅿️ gauche' : '🅿️ droite'}`);
  }
  if (data.type === 'state') {
    stateOnline = data.state;
  }
  console.log("🎯 Message reçu :", data);

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
  }
});

function finishGame(winnerText: string) {
  gamePausedLocal = true;
  gameWinnerText = winnerText;

  setTimeout(() => {
    gameWinnerText = null;
    stateLocal.score.left = 0;
    stateLocal.score.right = 0;
    resetLocalGame();
    startCountdownLocal(() => gamePausedLocal = false);
  }, 5000);
}
