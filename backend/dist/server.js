"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const init_db_1 = require("./init_db");
const fastify_1 = __importDefault(require("fastify"));
const ws_1 = require("ws");
const url_1 = require("url");
const game_logic_js_1 = require("../../frontend/engine_play/dist/game_logic.js");
const tournament_js_1 = require("../../frontend/engine_play/dist/tournament.js");
/* =========
   Constantes
   ========= */
const CANVAS_W = 800;
const CANVAS_H = 600;
const TICK_MS = Math.floor(1000 / 60);
const SNAP_MS = Math.floor(1000 / 60);
/* =========
   HTTP
   ========= */
const app = (0, fastify_1.default)();
const httpServer = app.server;
/* ==========================================
   WS unique + routing par HTTP upgrade
   ========================================== */
const wss = new ws_1.WebSocketServer({ noServer: true });
httpServer.on('upgrade', (req, socket, head) => {
    const u = (0, url_1.parse)(req.url || '', true);
    const pathname = u.pathname || '';
    // On n’accepte que /ws et /ws/local sur ce serveur WS
    if (pathname === '/ws' || pathname === '/ws/local') {
        wss.handleUpgrade(req, socket, head, (ws) => {
            // on stocke le path pour la branche dans 'connection'
            ws.__pathname = pathname;
            wss.emit('connection', ws, req);
        });
    }
    else {
        socket.destroy();
    }
});
/* ==========================================
   1v1 EN LIGNE (identique à ton original)
   ========================================== */
const rooms = [];
let pending = null;
function broadcast(room, obj) {
    const s = JSON.stringify(obj);
    for (const ci of room.clients) {
        if (ci.ws.readyState === ws_1.WebSocket.OPEN)
            ci.ws.send(s);
    }
}
function safeSend(ws, obj) {
    try {
        ws.send(JSON.stringify(obj));
    }
    catch { }
}
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
function endAndCleanupRoom(room, reason) {
    try {
        broadcast(room, { type: 'end', reason });
        try {
            room.engine?.dispose?.();
        }
        catch { }
        try {
            room.engine.changeStatus(false);
        }
        catch { }
        const idx = rooms.indexOf(room);
        if (idx !== -1)
            rooms.splice(idx, 1);
        for (const ci of room.clients) {
            try {
                ci.ws.close();
            }
            catch { }
        }
    }
    catch { }
}
/* ==========================================
   TOURNOI LOCAL (séquentiel) sur /ws/local
   ========================================== */
function normalizeEngineKey(code, key) {
    if (code === 'ArrowUp' || key === 'ArrowUp')
        return 'ArrowUp';
    if (code === 'ArrowDown' || key === 'ArrowDown')
        return 'ArrowDown';
    if (code === 'KeyW' || key === 'z' || key === 'Z')
        return 'z';
    if (code === 'KeyS' || key === 's' || key === 'S')
        return 's';
    return null;
}
function startLocalTicker(sess) {
    if (sess.ticker)
        clearInterval(sess.ticker);
    const FRAME_MS = 1000 / 60;
    sess.ticker = setInterval(() => {
        if (!sess.t)
            return;
        if (sess.awaitingContinue)
            return; // ⛔ gel
        const snap = sess.t.playLocal?.();
        if (snap.running == false)
            console.log('fin envoie a matt');
        sess.t.launch = false;
        if (snap) {
            safeSend(sess.ws, { type: 'state', state: snap });
            if (!snap.running) {
                // manche finie → on fige. AUCUN autre message.
                sess.awaitingContinue = true;
                sess.continueCount = 0;
            }
        }
    }, FRAME_MS);
}
/* ==========================================
   Branche WS unique → routing par pathname
   ========================================== */
wss.on('connection', (ws, req) => {
    const pathname = ws.__pathname;
    // ---------- 1) 1v1 en ligne ----------
    if (pathname === '/ws') {
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
        return;
    }
    // ---------- 2) Tournoi local ----------
    if (pathname === '/ws/local') {
        const sess = { ws, t: null };
        safeSend(ws, { type: 'info', code: 'waiting_conf' });
        ws.on('message', (raw) => {
            let msg;
            try {
                msg = JSON.parse(raw.toString());
            }
            catch {
                return;
            }
            switch (msg.type) {
                case 'conf': {
                    const conf = msg.config;
                    if (!conf || !Array.isArray(conf.players)) {
                        safeSend(ws, { type: 'info', code: 'conf_invalid' });
                        return;
                    }
                    try {
                        sess.t = new tournament_js_1.Tournament(CANVAS_W, CANVAS_H, conf);
                        safeSend(ws, { type: 'start', w: CANVAS_W, h: CANVAS_H });
                        startLocalTicker(sess);
                    }
                    catch (e) {
                        console.error('LocalTournament init error:', e);
                        safeSend(ws, { type: 'info', code: 'conf_error' });
                    }
                    break;
                }
                case 'key': {
                    if (!sess.t)
                        return;
                    const code = msg.code;
                    const key = msg.key;
                    const isPressed = !!msg.isPressed;
                    const norm = normalizeEngineKey(code, key);
                    if (!norm)
                        return;
                    try {
                        sess.t.redirectTournament?.(norm, isPressed);
                    }
                    catch { }
                    break;
                }
                case 'continue': {
                    if (!sess.t || !sess.awaitingContinue)
                        break;
                    // Dé-gèle
                    sess.awaitingContinue = false;
                    sess.t.launch = true;
                    // 👇 Kick immédiat : recalcule un frame et renvoie un state tout de suite
                    try {
                        const snap = sess.t.playLocal?.();
                        if (snap)
                            safeSend(sess.ws, { type: 'state', state: snap });
                    }
                    catch { }
                    break;
                }
                case 'info_players': {
                    try {
                        if (sess.t) {
                            const res = sess.t.getNextMatch();
                            const player1 = res[0];
                            const player2 = res[1];
                            if (!player1) {
                                safeSend(sess.ws, { type: 'tournament_end' });
                                clearInterval(sess.ticker);
                                sess.ticker = undefined;
                                break;
                            }
                            const player = `${player1} VS ${player2}`;
                            safeSend(sess.ws, { type: 'info_players', player });
                        }
                    }
                    catch (err) {
                        console.error('info_players error', err);
                    }
                    break;
                }
                default: break;
            }
        });
        ws.on('close', () => {
            if (sess.ticker)
                clearInterval(sess.ticker);
            sess.ticker = undefined;
            sess.t = null;
        });
        ws.on('error', () => ws.emit('close'));
        return;
    }
});
/* ==========================================
   Boucle serveur (1v1 uniquement)
   ========================================== */
let lastSnap = Date.now();
setInterval(() => {
    const now = Date.now();
    const endedRooms = [];
    // Update rooms 1v1
    for (const room of rooms) {
        room.lastTick = now;
        // inputs
        for (const ci of room.clients) {
            const idx = (ci.role === 'left') ? 0 : 1;
            room.engine.applyInput(idx, ci.lastDir);
        }
        // avance la simu
        room.engine.update();
        if (!room.engine.getStatus()) {
            if (!init_db_1.db)
                (0, init_db_1.initDB)(); // il faut initialiser la DB au démarrage
            const data_match = room.engine.getGameState();
            (0, init_db_1.saveMatch)({
                player1: data_match.paddles[0]?.name ?? 'Player 1',
                player2: data_match.paddles[1]?.name ?? 'Player 2',
                score: `${data_match.scores.A} - ${data_match.scores.B}`,
                totalExchanges: data_match.tracker.totalExchanges,
                maxExchanges: data_match.tracker.maxRally,
                date: new Date().toISOString().split("T")[0]
            });
            endedRooms.push(room);
        }
    }
    // Snapshots 1v1
    if (now - lastSnap >= SNAP_MS) {
        lastSnap = now;
        for (const room of rooms) {
            if (!room.engine.getStatus())
                continue;
            const snapshot = room.engine.getSnapshot();
            const payload = JSON.stringify({ type: 'state', snapshot });
            for (const ci of room.clients) {
                if (ci.ws.readyState === ws_1.WebSocket.OPEN)
                    ci.ws.send(payload);
            }
        }
    }
    // Cleanup rooms finies
    for (const r of endedRooms) {
        try {
            const finalSnap = r.engine.getSnapshot();
            broadcast(r, { type: 'state', snapshot: finalSnap });
        }
        catch { }
        endAndCleanupRoom(r, 'game_over');
    }
}, TICK_MS);
/* =========
   Routes
   ========= */
app.get('/', async () => ({ ok: true }));
app.get('/ws/match', async (req, reply) => {
    const rows = (0, init_db_1.getAllMatches)();
    return rows; // Fastify renvoie ça en JSON automatiquement
});
const PORT = Number(process.env.PORT) || 3002;
app.listen({ port: PORT, host: '0.0.0.0' }).then(() => {
    console.log('🚀 HTTP on', PORT, '| WS via httpUpgrade for /ws and /ws/local');
});
