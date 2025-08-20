"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const ws_1 = require("ws");
const game_logic_js_1 = require("../../frontend/engine_play/dist/game_logic.js");
const app = (0, fastify_1.default)();
const httpServer = app.server;
// Taille logique du terrain (le rendu se fait côté client)
const CANVAS_W = 800;
const CANVAS_H = 600;
const wss = new ws_1.WebSocketServer({ server: httpServer, path: '/ws' });
const rooms = [];
let pending = null;
function createRoom(a, b) {
    const config = {
        mode: '1v1',
        playerSetup: [
            { type: 'human', playerId: 1 },
            { type: 'human', playerId: 2 },
            // P3/P4 absents → le moteur les mettra à null
        ]
    };
    const engine = new game_logic_js_1.GameLogic(CANVAS_W, CANVAS_H, config);
    const room = {
        id: 'room_' + Date.now(),
        engine,
        clients: [a, b],
        lastTick: Date.now(),
    };
    rooms.push(room);
    a.ws.send(JSON.stringify({ type: 'start', role: 'left', w: CANVAS_W, h: CANVAS_H }));
    b.ws.send(JSON.stringify({ type: 'start', role: 'right', w: CANVAS_W, h: CANVAS_H }));
    return room;
}
wss.on('connection', (ws) => {
    const client = { ws, role: 'left', lastDir: 'stop' };
    if (!pending) {
        client.role = 'left';
        pending = client;
        ws.send(JSON.stringify({ type: 'waiting', role: 'left' }));
    }
    else {
        client.role = 'right';
        const a = pending;
        pending = null;
        createRoom(a, client);
    }
    ws.on('message', (raw) => {
        try {
            const msg = JSON.parse(raw.toString());
            if (msg.type === 'input') {
                // retrouve la room du client et note sa direction
                for (const room of rooms) {
                    const ci = room.clients.find(c => c.ws === ws);
                    if (ci) {
                        ci.lastDir = msg.dir;
                        break;
                    }
                }
            }
        }
        catch { /* ignore */ }
    });
    ws.on('close', () => {
        // Si c'était le "pending"
        if (pending && pending.ws === ws) {
            pending = null;
            return;
        }
        // Sinon enlève le client de sa room et "vide" la room
        for (let i = rooms.length - 1; i >= 0; i--) {
            const r = rooms[i];
            if (r.clients.some(c => c.ws === ws)) {
                // notifie l'autre client
                for (const c of r.clients) {
                    if (c.ws !== ws && c.ws.readyState === ws_1.WebSocket.OPEN) {
                        c.ws.send(JSON.stringify({ type: 'info', message: 'opponent disconnected' }));
                    }
                }
                rooms.splice(i, 1);
            }
        }
    });
});
// Boucle: 60 Hz tick, 20 Hz snapshots
const TICK_MS = Math.floor(1000 / 60);
const SNAP_MS = Math.floor(1000 / 20);
let lastSnap = Date.now();
setInterval(() => {
    const now = Date.now();
    for (const room of rooms) {
        room.lastTick = now;
        // applique les inputs aux deux joueurs (left = index 0, right = index 1)
        for (const ci of room.clients) {
            const idx = (ci.role === 'left') ? 0 : 1;
            room.engine.applyInput(idx, ci.lastDir);
        }
        // avance la simulation
        room.engine.update();
    }
    // snapshots aux clients (20 Hz)
    if (now - lastSnap >= SNAP_MS) {
        lastSnap = now;
        for (const room of rooms) {
            const snapshot = room.engine.getSnapshot(); // alias de getGameState()
            const payload = JSON.stringify({ type: 'state', snapshot });
            for (const ci of room.clients) {
                if (ci.ws.readyState === ws_1.WebSocket.OPEN) {
                    ci.ws.send(payload);
                }
            }
        }
    }
}, TICK_MS);
// route ping
app.get('/', async () => ({ ok: true }));
const PORT = Number(process.env.PORT) || 3002;
app.listen({ port: PORT, host: '0.0.0.0' }).then(() => {
    console.log('🚀 Server + WS on', PORT);
});
