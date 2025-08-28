"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const ws_1 = require("ws");
const game_logic_js_1 = require("../../frontend/engine_play/dist/game_logic.js");
const crypto_1 = require("crypto");
const app = (0, fastify_1.default)();
const httpServer = app.server;
const CANVAS_W = 800;
const CANVAS_H = 600;
const tournaments = new Map();
const wss = new ws_1.WebSocketServer({ server: httpServer, path: '/ws' });
function broadcast(room, obj) {
    const s = JSON.stringify(obj);
    for (const ci of room.clients) {
        if (ci.ws.readyState === ws_1.WebSocket.OPEN) {
            ci.ws.send(s);
        }
    }
}
function endAndCleanupRoom(room, reason) {
    try {
        broadcast(room, { type: 'end', reason });
        // stop moteur
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
        // ferme les sockets de la room
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
            { type: 'human', playerId: 1, name: '' },
            { type: 'human', playerId: 2, name: '' },
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
                for (const room of rooms) {
                    const ci = room.clients.find(c => c.ws === ws);
                    if (ci) {
                        ci.lastDir = msg.dir;
                        break;
                    }
                }
            }
        }
        catch { }
    });
    ws.on('close', () => {
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
                safeSend(survivor.ws, { type: 'info', code: 'opponent_disconnected' });
                try {
                    r.engine.changeStatus(false);
                }
                catch { }
                rooms.splice(i, 1);
                requeue(survivor);
                break;
            }
        }
    });
    ws.on('error', () => ws.emit('close'));
});
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
    // 3) cleanup des rooms finies (envoie 1 dernier state + end + close)
    for (const r of endedRooms) {
        try {
            const finalSnap = r.engine.getSnapshot(); // doit contenir running:false
            broadcast(r, { type: 'state', snapshot: finalSnap }); // ← dernier frame
        }
        catch { }
        endAndCleanupRoom(r, 'game_over');
    }
}, TICK_MS);
// route ping
app.get('/', async () => ({ ok: true }));
// abonnés à la liste publique
const publicSubs = new Set();
// abonnés par tournoi (lobby)
const lobbySubs = new Map(); // id -> Set<ws>
function send(ws, obj) {
    try {
        ws.send(JSON.stringify(obj));
    }
    catch { }
}
function broadcastOpenList() {
    const payload = JSON.stringify({
        type: 'open_list',
        list: [...tournaments.values()]
            .filter(t => t.state === 'OPEN')
            .map(t => ({ id: t.id, name: t.name, size: t.size, taken: t.slots.filter(s => s.playerId).length }))
    });
    for (const ws of publicSubs) {
        if (ws.readyState === ws_1.WebSocket.OPEN)
            ws.send(payload);
    }
}
app.post('/ws/tournaments', async (req, reply) => {
    const { name, size } = req.body;
    if (!name || ![4, 8, 16].includes(size))
        return reply.status(400).send({ error: 'bad_params' });
    const id = (0, crypto_1.randomUUID)();
    const t = {
        id,
        name,
        size,
        taken: 0,
        state: 'OPEN',
        createdAt: Date.now(),
        slots: Array.from({ length: size }, (_, i) => ({ slotIndex: i }))
    };
    tournaments.set(id, t);
    broadcastOpenList();
    return { id: t.id, name: t.name, size: t.size, taken: 0, state: t.state, createdAt: t.createdAt };
});
app.get('/ws/tournaments', async () => {
    return [...tournaments.values()];
});
app.post('/ws/tournaments/:id/join', async (req, reply) => {
    const { id } = req.params;
    const { name } = req.body || {};
    const t = tournaments.get(id);
    if (!t)
        return reply.code(404).send({ error: 'not_found' });
    if (t.state !== 'OPEN')
        return reply.code(409).send({ error: 'not_open' });
    if (!name)
        return reply.code(400).send({ error: 'bad_params' });
    const slot = t.slots.find(s => !s.playerId);
    if (!slot)
        return reply.code(409).send({ error: 'full' });
    const playerId = (0, crypto_1.randomUUID)();
    slot.playerId = playerId;
    slot.name = name;
    slot.ready = true; // MVP: auto-ready
    // si on a rempli tous les slots → passe READY (tu pourras déclencher le bracket ensuite)
    const taken = t.slots.filter(s => s.playerId).length;
    if (taken === t.size) {
        t.state = 'READY';
    }
    t.taken += 1;
    // Renvoie ce que ton front loggue actuellement
    broadcastLobbyUpdate(id);
    broadcastOpenList();
    return { tournamentId: id, playerId, slotIndex: slot.slotIndex };
});
app.get('/ws/tournaments/:id', async (req, reply) => {
    const { id } = req.params;
    const t = tournaments.get(id);
    if (!t)
        return reply.code(404).send({ error: 'not_found' });
    return t; // ou une projection si tu veux cacher des champs
});
function broadcastLobbyUpdate(tid) {
    const subs = lobbySubs.get(tid);
    if (!subs || subs.size === 0)
        return;
    const t = tournaments.get(tid);
    if (!t)
        return;
    const payload = JSON.stringify({ type: 'tournament_update', tournament: t });
    for (const ws of subs) {
        if (ws.readyState === ws_1.WebSocket.OPEN)
            ws.send(payload);
    }
}
const PORT = Number(process.env.PORT) || 3002;
app.listen({ port: PORT, host: '0.0.0.0' }).then(() => {
    console.log('🚀 Server + WS on', PORT);
});
