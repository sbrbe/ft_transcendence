"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const ws_1 = __importStar(require("ws"));
const app = (0, fastify_1.default)();
const server = app.server; // ← récupère le serveur Node intégré à Fastify
const wss = new ws_1.WebSocketServer({ server });
let games = [];
let nextGameId = 1;
const MAX_GAMES = 8;
// === Fonctions de jeu ===
function resetBall(state) {
    state.ball.x = 400;
    state.ball.y = 300;
    state.ball.dx = Math.random() < 0.5 ? 4 : -4;
    state.ball.dy = Math.random() < 0.5 ? 4 : -4;
}
function startCountdown(game, callback) {
    let countdown = 3;
    game.state.countdownText = countdown.toString();
    game.paused = true;
    broadcastState(game);
    const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            game.state.countdownText = countdown.toString();
        }
        else if (countdown === 0) {
            game.state.countdownText = 'GO!';
        }
        else {
            game.state.countdownText = null;
            game.paused = false;
            clearInterval(interval);
            callback();
        }
        broadcastState(game);
    }, 1000);
}
function updateGame(game) {
    if (game.paused)
        return;
    const b = game.state.ball;
    const p = game.state.paddles;
    const s = game.state.score;
    p.left.y += p.left.dy;
    p.right.y += p.right.dy;
    p.left.y = Math.max(0, Math.min(500, p.left.y));
    p.right.y = Math.max(0, Math.min(500, p.right.y));
    b.x += b.dx;
    b.y += b.dy;
    if (b.y <= 0 || b.y >= 600)
        b.dy *= -1;
    if ((b.x - b.radius < 20 && b.y > p.left.y && b.y < p.left.y + 100) ||
        (b.x + b.radius > 780 && b.y > p.right.y && b.y < p.right.y + 100)) {
        b.dx *= -1.05;
        b.dy *= 1.05;
    }
    if (b.x < 0) {
        s.right++;
        if (s.right === 3)
            finishOnlineGame(game, '🅿️ Droite a gagné !');
        else {
            resetBall(game.state);
            startCountdown(game, () => { });
        }
    }
    else if (b.x > 800) {
        s.left++;
        if (s.left === 3)
            finishOnlineGame(game, '🅿️ Gauche a gagné !');
        else {
            resetBall(game.state);
            startCountdown(game, () => { });
        }
    }
    broadcastState(game);
}
function broadcastState(game) {
    const msg = JSON.stringify({ type: 'state', state: game.state });
    for (const role of ['left', 'right']) {
        const player = game.players[role];
        if (player?.ws.readyState === ws_1.default.OPEN) {
            player.ws.send(msg);
        }
    }
}
function finishOnlineGame(game, winnerText) {
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
function finishOnlineGameByForfeit(game, winnerText) {
    game.paused = true;
    game.state.countdownText = winnerText;
    broadcastState(game);
    const msg = JSON.stringify({ type: 'forfeit', message: winnerText });
    for (const role of ['left', 'right']) {
        const player = game.players[role];
        if (player?.ws.readyState === ws_1.default.OPEN) {
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
function createNewGame() {
    const state = {
        ball: { x: 400, y: 300, dx: 0, dy: 0, radius: 8 },
        paddles: {
            left: { y: 250, dy: 0 },
            right: { y: 250, dy: 0 },
        },
        score: { left: 0, right: 0 },
        countdownText: null
    };
    const game = {
        id: nextGameId++,
        players: {},
        state,
        paused: true
    };
    games.push(game);
    return game;
}
// === Gestion des connexions WS ===
wss.on('connection', (ws) => {
    let assigned = false;
    // Nettoie les parties avec 0 joueur (au cas où)
    games = games.filter(game => game.players.left || game.players.right);
    for (const game of games) {
        if (!game.players.left) {
            game.players.left = { ws, role: 'left' };
            ws.send(JSON.stringify({ type: 'role', role: 'left', gameId: game.id }));
            assigned = true;
        }
        else if (!game.players.right) {
            game.players.right = { ws, role: 'right' };
            ws.send(JSON.stringify({ type: 'role', role: 'right', gameId: game.id }));
            assigned = true;
            game.players.left?.ws.send(JSON.stringify({
                type: 'start',
                message: '✅ Partie prête. Vous êtes joueur de gauche.'
            }));
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
    if (games.length >= MAX_GAMES) {
        ws.send(JSON.stringify({
            type: 'error',
            message: '❌ Toutes les parties sont actuellement pleines. Veuillez réessayer dans quelques instants.'
        }));
        ws.close(); // tu peux aussi l’enlever si tu préfères laisser le socket ouvert
        return;
    }
    // Si aucun slot libre, on crée un nouveau jeu
    const newGame = createNewGame();
    newGame.players.left = { ws, role: 'left' };
    ws.send(JSON.stringify({ type: 'role', role: 'left', gameId: newGame.id }));
    setupGameCommunication(ws, newGame);
});
function setupGameCommunication(ws, game) {
    ws.on('message', msg => {
        const data = JSON.parse(msg.toString());
        if (data.type === 'paddleMove') {
            game.state.paddles[data.role].dy = data.dy;
        }
    });
    ws.on('close', () => {
        if (game.interval)
            clearInterval(game.interval);
        finishOnlineGameByForfeit(game, `🅿️ ${game.players.left?.ws === ws ? 'Gauche' : 'Droite'} a quitté la partie`);
        // Supprime la game de la liste globale
        games = games.filter(g => g !== game);
    });
}
// === Lancement ===
server.listen(3002, '0.0.0.0', () => {
    console.log('🚀 WebSocket server running on http://0.0.0.0:3002');
});
