import Fastify from 'fastify';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import { gameConfig } from '../../frontend/engine_play/dist/types.js';
import { GameLogic } from '../../frontend/engine_play/dist/game_logic.js';

type Dir = 'up'|'down'|'stop';
type Role = 'left'|'right';

type ClientInfo = { ws: WebSocket; role: Role; lastDir: Dir };

const app = Fastify();
const httpServer = app.server;

// Taille logique du terrain (le rendu se fait côté client)
const CANVAS_W = 800;
const CANVAS_H = 600;

const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

type Room = {
  id: string;
  engine: GameLogic;
  clients: ClientInfo[];  // [left, right]
  lastTick: number;
};

const rooms: Room[] = [];
let pending: ClientInfo | null = null;

function createRoom(a: ClientInfo, b: ClientInfo): Room {
  const config: gameConfig = {
    mode: '1v1',
    playerSetup: [
      { type: 'human', playerId: 1 },
      { type: 'human', playerId: 2 },
      // P3/P4 absents → le moteur les mettra à null
    ]
  };

  const engine = new GameLogic(CANVAS_W, CANVAS_H, config);
  const room: Room = {
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

wss.on('connection', (ws: WebSocket) => {
  const client: ClientInfo = { ws, role: 'left', lastDir: 'stop' };

  if (!pending) {
    client.role = 'left';
    pending = client;
    ws.send(JSON.stringify({ type: 'waiting', role: 'left' }));
  } else {
    client.role = 'right';
    const a = pending; pending = null;
    createRoom(a, client);
  }

  ws.on('message', (raw: RawData) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'input') {
        // retrouve la room du client et note sa direction
        for (const room of rooms) {
          const ci = room.clients.find(c => c.ws === ws);
          if (ci) { ci.lastDir = msg.dir as Dir; break; }
        }
      }
    } catch { /* ignore */ }
  });

  ws.on('close', () => {
    // Si c'était le "pending"
    if (pending && pending.ws === ws) { pending = null; return; }
    // Sinon enlève le client de sa room et "vide" la room
    for (let i = rooms.length - 1; i >= 0; i--) {
      const r = rooms[i];
      if (r.clients.some(c => c.ws === ws)) {
        // notifie l'autre client
        for (const c of r.clients) {
          if (c.ws !== ws && c.ws.readyState === WebSocket.OPEN) {
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
        if (ci.ws.readyState === WebSocket.OPEN) {
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
