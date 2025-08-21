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
function broadcast(room, obj) {
    const s = JSON.stringify(obj);
    for (const ci of room.clients) {
        if (ci.ws.readyState === ws_1.WebSocket.OPEN) {
            ci.ws.send(s);
        }
    }
}
// Nettoie TOUTE la room: notifie, stoppe moteur, retire la room, ferme sockets
function endAndCleanupRoom(room, reason) {
    try {
        // informe clients (le client doit capter 'end' et retourner au menu)
        broadcast(room, { type: 'end', reason });
        // stop moteur (si ton GameLogic expose une méthode)
        try {
            room.engine?.dispose?.();
        }
        catch { }
        try {
            room.engine.changeStatus(false);
        }
        catch { }
        // retire la room de la liste
        const idx = rooms.indexOf(room);
        if (idx !== -1)
            rooms.splice(idx, 1);
        // ferme les sockets de la room (propre retour côté client)
        for (const ci of room.clients) {
            try {
                ci.ws.close();
            }
            catch { }
        }
    }
    catch { }
}
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
// Helpers
function safeSend(ws, obj) {
    try {
        ws.send(JSON.stringify(obj));
    }
    catch { }
}
function requeue(client) {
    client.lastDir = 'stop';
    if (!pending) {
        client.role = 'left';
        pending = client;
        safeSend(client.ws, { type: 'waiting', role: 'left' });
    }
    else {
        client.role = 'right';
        const a = pending;
        pending = null;
        createRoom(a, client);
    }
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
        // 1) si c’était le pending, on libère juste
        if (pending && pending.ws === ws) {
            pending = null;
            return;
        }
        // 2) sinon, trouve la room et requeue le survivant
        for (let i = rooms.length - 1; i >= 0; i--) {
            const r = rooms[i];
            const idx = r.clients.findIndex(c => c.ws === ws);
            if (idx !== -1) {
                const survivor = r.clients[1 - idx];
                // informe le survivant
                safeSend(survivor.ws, { type: 'info', code: 'opponent_disconnected' });
                // stoppe le jeu côté serveur sans fermer le survivant
                try {
                    r.engine.changeStatus(false);
                }
                catch { }
                // retire la room
                rooms.splice(i, 1);
                // requeue immédiat du survivant (comme une nouvelle connexion)
                requeue(survivor);
                break;
            }
        }
    });
    // Bonus: route les erreurs vers close (déclenche le même cleanup)
    ws.on('error', () => ws.emit('close'));
});
// Boucle: 60 Hz tick, 20 Hz snapshots
const TICK_MS = Math.floor(1000 / 60);
const SNAP_MS = Math.floor(1000 / 60);
let lastSnap = Date.now();
setInterval(() => {
    const now = Date.now();
    const endedRooms = [];
    // 1) update de chaque room
    for (const room of rooms) {
        room.lastTick = now;
        // applique les inputs aux deux joueurs
        for (const ci of room.clients) {
            const idx = (ci.role === 'left') ? 0 : 1;
            room.engine.applyInput(idx, ci.lastDir);
        }
        // avance la simulation
        room.engine.update();
        // si la partie est finie (GameLogic.running = false), marque-la pour cleanup
        if (!room.engine.getStatus()) {
            endedRooms.push(room);
        }
    }
    // 2) snapshots (seulement pour les rooms encore actives)
    if (now - lastSnap >= SNAP_MS) {
        lastSnap = now;
        for (const room of rooms) {
            if (!room.engine.getStatus())
                continue; // ignore rooms finies
            const snapshot = room.engine.getSnapshot();
            const payload = JSON.stringify({ type: 'state', snapshot });
            for (const ci of room.clients) {
                if (ci.ws.readyState === ws_1.WebSocket.OPEN) {
                    ci.ws.send(payload);
                }
            }
        }
    }
    // 3) cleanup des rooms finies (envoie 'end' + ferme sockets + retire la room)
    for (const r of endedRooms) {
        endAndCleanupRoom(r, 'game_over');
    }
}, TICK_MS);
// route ping
app.get('/', async () => ({ ok: true }));
const PORT = Number(process.env.PORT) || 3002;
app.listen({ port: PORT, host: '0.0.0.0' }).then(() => {
    console.log('🚀 Server + WS on', PORT);
});
