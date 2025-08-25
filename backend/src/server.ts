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

function broadcast(room: Room, obj: any) {
  const s = JSON.stringify(obj);
  for (const ci of room.clients) {
    if (ci.ws.readyState === WebSocket.OPEN) {
      ci.ws.send(s);
    }
  }
}

// Nettoie TOUTE la room: notifie, stoppe moteur, retire la room, ferme sockets
function endAndCleanupRoom(room: Room, reason: 'game_over'|'opponent_disconnected'|'server_stop') {
  try {
    // informe clients (le client doit capter 'end' et retourner au menu)
    broadcast(room, { type: 'end', reason });

    // stop moteur (si ton GameLogic expose une méthode)
    try { (room.engine as any)?.dispose?.(); } catch {}
    try { room.engine.changeStatus(false); } catch {}

    // retire la room de la liste
    const idx = rooms.indexOf(room);
    if (idx !== -1) rooms.splice(idx, 1);

    // ferme les sockets de la room (propre retour côté client)
    for (const ci of room.clients) {
      try { ci.ws.close(); } catch {}
    }
  } catch {}
}


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

// Helpers
function safeSend(ws: WebSocket, obj: any) {
  try { ws.send(JSON.stringify(obj)); } catch {}
}

function requeue(client: ClientInfo) {
  client.lastDir = 'stop';
  if (!pending) {
    client.role = 'left';
    pending = client;
    safeSend(client.ws, { type: 'waiting', role: 'left' });
  } else {
    client.role = 'right';
    const a = pending; pending = null;
    createRoom(a, client);
  }
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
    // 1) si c’était le pending, on libère juste
    if (pending && pending.ws === ws) { pending = null; return; }
  
    // 2) sinon, trouve la room et requeue le survivant
    for (let i = rooms.length - 1; i >= 0; i--) {
      const r = rooms[i];
      const idx = r.clients.findIndex(c => c.ws === ws);
      if (idx !== -1) {
        const survivor = r.clients[1 - idx];
  
        // informe le survivant
        safeSend(survivor.ws, { type: 'info', code: 'opponent_disconnected' });
  
        // stoppe le jeu côté serveur sans fermer le survivant
        try { r.engine.changeStatus(false); } catch {}
  
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
  const endedRooms: Room[] = [];

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
      if (!room.engine.getStatus()) continue; // ignore rooms finies
      const snapshot = room.engine.getSnapshot();
      const payload = JSON.stringify({ type: 'state', snapshot });
      for (const ci of room.clients) {
        if (ci.ws.readyState === WebSocket.OPEN) {
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
  } catch {}
  endAndCleanupRoom(r, 'game_over');
}

}, TICK_MS);


// route ping
app.get('/', async () => ({ ok: true }));

const PORT = Number(process.env.PORT) || 3002;
app.listen({ port: PORT, host: '0.0.0.0' }).then(() => {
  console.log('🚀 Server + WS on', PORT);
});
