const socket = new WebSocket(`ws://${window.location.hostname}:3002`);
let role: 'left' | 'right' = 'left';
let isLocalMode = false;
let gamePausedLocal = true;
let gamePausedOnline = true;
let  isAIMode = true;
let gameWinnerText: string | null = null;
let aiLastKey: 'ArrowUp' | 'ArrowDown' | null = null;

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

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
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

document.addEventListener('DOMContentLoaded', () => {
  // ✅ Init canvas et ctx SEULEMENT maintenant
  canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d")!;

  document.getElementById('btn-register')?.addEventListener('click', () => {
    showView('view-register');
  });

  document.getElementById('btn-login')?.addEventListener('click', () => {
    showView('view-login');
  });

  document.getElementById('nav-home')?.addEventListener('click', () => {
    isLocalMode = false;
    gamePausedLocal = true;
    gamePausedOnline = true;
    gameWinnerText = null;

    stateLocal = {
      paddles: {
        left: { y: 250, dy: 0 },
        right: { y: 250, dy: 0 }
      },
      ball: { x: 400, y: 300, dx: 0, dy: 0, radius: 8 },
      score: { left: 0, right: 0 },
      countdownText: null
    };

    stateOnline = {
      paddles: {
        left: { y: 250, dy: 0 },
        right: { y: 250, dy: 0 }
      },
      ball: { x: 400, y: 300, radius: 8 },
      score: { left: 0, right: 0 },
      countdownText: null
    };
    
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ready' }));
    } else {
      socket.addEventListener('open', () => {
        socket.send(JSON.stringify({ type: 'ready' }));
      });
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    displayMessage("");
    showView('view-home');
  });
  
  document.getElementById('nav-game')?.addEventListener('click', () => {
    console.log("✅ Local click");
    isLocalMode = true;
    gamePausedOnline = true;
    isAIMode = false;
    resetLocalGame();
    showView('view-game');
    history.pushState(null, '', '/game');
    displayMessage("🎮 Jeu local (2 joueurs sur 1 clavier)");
    startCountdownLocal(() => gamePausedLocal = false);
  });
  
  document.getElementById('nav-game-vs-ia')?.addEventListener('click', () => {
    console.log("✅ Local VS IA click");
    isLocalMode = true; // Le match est local
    gamePausedOnline = true; // Pas online
    isAIMode = true;
    resetLocalGame();
    showView('view-game');
    history.pushState(null, '', '/game');
    displayMessage("🤖 Match local contre l'IA");
    startCountdownLocal(() => {
      gamePausedLocal = false;
      
      if (aiInterval) clearInterval(aiInterval);
      aiInterval = window.setInterval(runLocalAI, 1000); // IA ajuste sa cible toutes les 1000ms
    });
  });

  document.getElementById('nav-game-online')?.addEventListener('click', () => {
    console.log("✅ Online click");
    isLocalMode = false;
    gamePausedLocal = true;
    isAIMode = false;
    showView('view-game');
    history.pushState(null, '', '/game');
    displayMessage("🕓 En attente d’un autre joueur...");
    socket.send(JSON.stringify({ type: 'ready' }));
  });
  renderLoop();
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
  const isLeftKey = e.key === 'z' || e.key === 's';
  const isRightKey = e.key === 'ArrowUp' || e.key === 'ArrowDown';
  const dy = (e.key === 'z' || e.key === 'ArrowUp') ? -5 : 5;

  if (isLocalMode) {
    if (isLeftKey) stateLocal.paddles.left.dy = dy;
    if (isRightKey && (!isAIMode|| e.isTrusted === false)) stateLocal.paddles.right.dy = dy;
  } else {
    if (isRightKey && (!isAIMode|| e.isTrusted === false)) {
      socket.send(JSON.stringify({ type: 'paddleMove', role, dy }));
    }
  }
});

document.addEventListener("keyup", e => {
  const isLeftKey = e.key === 'z' || e.key === 's';
  const isRightKey = e.key === 'ArrowUp' || e.key === 'ArrowDown';

  if (isLocalMode) {
    if (isLeftKey) stateLocal.paddles.left.dy = 0;
    if (isRightKey && (!isAIMode|| e.isTrusted === false)) stateLocal.paddles.right.dy = 0;
  } else {
    if (isRightKey && (!isAIMode|| e.isTrusted === false)) {
      socket.send(JSON.stringify({ type: 'paddleMove', role, dy: 0 }));
    }
  }
});

const aiKeyboard = {
  up: false,
  down: false,
};



let aiTargetY = 300; // Au départ : centre

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
        b.dx *= -1.05;
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
  if (isLocalMode && !gamePausedLocal && isAIMode) {
    const paddleCenter = p.right.y + 50;
    const distance = aiTargetY - paddleCenter;
    const speed = 5;
    
    if (Math.abs(distance) <= speed) {
      p.right.dy = 0;
    } else {
      p.right.dy = distance > 0 ? speed : -speed;
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

socket.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  if (data.type === 'role') {
    role = data.role;
    displayMessage(`🎮 Connecté en tant que ${role === 'left' ? '🅿️ gauche' : '🅿️ droite'}`);
  }
  if (data.type === 'state') {
    stateOnline = data.state;
  }
  if (data.type === 'forfeit') {
    gamePausedOnline = true;
    gameWinnerText = data.message;
    setTimeout(() => {
      gameWinnerText = null;
      stateOnline.score.left = 0;
      stateOnline.score.right = 0;
      stateOnline.ball = { x: 400, y: 300, radius: 8 };
      stateOnline.paddles.left.y = 250;
      stateOnline.paddles.right.y = 250;
      showView('view-home');
      displayMessage("");
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

// === IA Local FRONT ===
let aiInterval: number | null = null;


function runLocalAI() {
  const ball = stateLocal.ball;
  const tableHeight = 600;

  if (ball.dx < 0) {
    aiTargetY = tableHeight / 2; // Recentre si balle part
  } else {
    let timeToReach = (780 - ball.x) / ball.dx;
    if (timeToReach < 0) timeToReach = 0;

    let predictedY = ball.y + ball.dy * timeToReach;

    while (predictedY < 0 || predictedY > tableHeight) {
      if (predictedY < 0) predictedY = -predictedY;
      if (predictedY > tableHeight) predictedY = 2 * tableHeight - predictedY;
    }

    aiTargetY = predictedY;
  }

  // Décision : doit-on monter, descendre ou s'arrêter ?
  const paddleCenter = stateLocal.paddles.right.y + 50;
  const distance = aiTargetY - paddleCenter;

  const speed = 5;
  let desiredKey: 'ArrowUp' | 'ArrowDown' | null;

  if (Math.abs(distance) <= speed) {
    desiredKey = null; // Arrêt
  } else {
    desiredKey = distance > 0 ? 'ArrowDown' : 'ArrowUp';
  }

  // Simule le bon event
  if (desiredKey !== aiLastKey) {
    if (aiLastKey) {
      const upEvent = new KeyboardEvent('keyup', { key: aiLastKey });
      document.dispatchEvent(upEvent);
    }
    if (desiredKey) {
      const downEvent = new KeyboardEvent('keydown', { key: desiredKey });
      document.dispatchEvent(downEvent);
    }
    aiLastKey = desiredKey;
  }
}

//          IA GAUCHE ET DROITE

// function updateLocalGame() {
//   if (!isLocalMode || gamePausedLocal) return;

//   const b = stateLocal.ball;
//   const p = stateLocal.paddles;

//   b.x += b.dx;
//   b.y += b.dy;

//   p.left.y += p.left.dy;
//   p.right.y += p.right.dy;

//   p.left.y = Math.max(0, Math.min(500, p.left.y));
//   p.right.y = Math.max(0, Math.min(500, p.right.y));

//   if (b.y <= 0 || b.y >= 600) b.dy *= -1;

//   if ((b.x - b.radius < 20 && b.y > p.left.y && b.y < p.left.y + 100) ||
//       (b.x + b.radius > 780 && b.y > p.right.y && b.y < p.right.y + 100)) {
//     b.dx *= -1.05;
//     b.dy *= 1.05;
//   }

//   if (b.x < 0) {
//     stateLocal.score.right++;
//     if (stateLocal.score.right === 3) {
//       finishGame("🅿️ Droite a gagné !");
//     } else {
//       resetLocalGame();
//       startCountdownLocal(() => gamePausedLocal = false);
//     }
//   } else if (b.x > 800) {
//     stateLocal.score.left++;
//     if (stateLocal.score.left === 3) {
//       finishGame("🅿️ Gauche a gagné !");
//     } else {
//       resetLocalGame();
//       startCountdownLocal(() => gamePausedLocal = false);
//     }
//   }

//   const speed = 5;

//   // IA GAUCHE ➜ pad gauche
//   const leftCenter = p.left.y + 50;
//   const leftDistance = aiTargetYLeft - leftCenter;
//   if (Math.abs(leftDistance) > 5) {
//     p.left.dy = leftDistance > 0 ? speed : -speed;
//   } else {
//     p.left.dy = 0;
//   }

//   // IA DROITE ➜ pad droit
//   const rightCenter = p.right.y + 50;
//   const rightDistance = aiTargetYRight - rightCenter;
//   if (Math.abs(rightDistance) > 5) {
//     p.right.dy = rightDistance > 0 ? speed : -speed;
//   } else {
//     p.right.dy = 0;
//   }
// }

//                    IA GAUCHE ET DROITE

// let aiInterval: number | null = null;

// document.getElementById('nav-game-vs-ia')?.addEventListener('click', () => {
//   console.log("✅ IA vs IA local");
//   isLocalMode = true;
//   gamePausedOnline = true;
//   resetLocalGame();
//   showView('view-game');
//   history.pushState(null, '', '/game');
//   displayMessage("🤖 IA contre IA");

//   startCountdownLocal(() => {
//     gamePausedLocal = false;
//     if (aiInterval) clearInterval(aiInterval);
//     aiInterval = window.setInterval(runBothAI, 1000); // met à jour les 2 cibles toutes les secondes
//   });
// });


// let aiTargetYLeft = 300;  // IA côté gauche
// let aiTargetYRight = 300; // IA côté droit

// function runBothAI() {
//   const ball = stateLocal.ball;
  
//   // === IA DROITE ===
//   if (ball.dx > 0) {
//     let timeToReachRight = (780 - ball.x) / ball.dx;
//     if (timeToReachRight < 0) timeToReachRight = 0;

//     let predictedYRight = ball.y + ball.dy * timeToReachRight;
//     while (predictedYRight < 0 || predictedYRight > 600) {
//       if (predictedYRight < 0) predictedYRight = -predictedYRight;
//       if (predictedYRight > 600) predictedYRight = 1200 - predictedYRight;
//     }
//     aiTargetYRight = predictedYRight;
//   } else {
//     aiTargetYRight = 300; // centre si balle part à gauche
//   }
  
//   // === IA GAUCHE ===
//   if (ball.dx < 0) {
//     let timeToReachLeft = (ball.x - 20) / -ball.dx; // vers la gauche => mur à ~20px
//     if (timeToReachLeft < 0) timeToReachLeft = 0;
    
//     let predictedYLeft = ball.y + ball.dy * timeToReachLeft;
//     while (predictedYLeft < 0 || predictedYLeft > 600) {
//       if (predictedYLeft < 0) predictedYLeft = -predictedYLeft;
//       if (predictedYLeft > 600) predictedYLeft = 1200 - predictedYLeft;
//     }
//     aiTargetYLeft = predictedYLeft;
//   } else {
//     aiTargetYLeft = 300; // centre si balle part à droite
//   }
// }