import { saveMatch, initDB, db } from './init_db.js';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import { parse as parseUrl } from 'url';
import { FastifyInstance } from 'fastify';
import { gameConfig, GameState } from '../shared/engine_play/src/types.js';
import { GameLogic } from '../shared/engine_play/src/game_logic.js';
import { Tournament, buildTournament } from '../shared/engine_play/src/tournament_logic.js';
import { v4 as uuidv4} from 'uuid';
import { sendTournamentData } from './clientInternal.js';

/* =========
   Types
   ========= */
   type Dir = 'up'|'down'|'stop';
   type Role = 'left'|'right';
   type IntervalHandle = ReturnType<typeof setInterval>;
   
   type ClientInfo = { ws: WebSocket; role: Role; lastDir: Dir };
   
   type Room = {
     id: string;
     engine: GameLogic;
     clients: ClientInfo[];  // [left, right]
     lastTick: number;
   };
   
  export type Payload = {
       player1: { name: string; score: number };
       player2: { name: string; score: number };
};
   
   
   type LocalSession = {
     ws: WebSocket;
     t: Tournament | null;
     tournamentId: string;
     ticker?: IntervalHandle;
     pausedUntil?: number;
     awaitingContinue?: boolean; // gel du tournoi
     continueCount?: number;
     winnerName?: string;
     historTournmnt: Payload[];
     userId?: string;
   };
   
   
   /* =========
      Constantes
      ========= */
   const CANVAS_W = 800;
   const CANVAS_H = 600;
   
   const TICK_MS = Math.floor(1000 / 60);
   const SNAP_MS = Math.floor(1000 / 60);
   
   /* =========
      WS
      ========= */
export function attachWs(app: FastifyInstance) {
		const wss = new WebSocketServer({ noServer: true });
	  
		app.server.on('upgrade', (req, socket, head) => {
		  const u = parseUrl(req.url || '', true);
		  const pathname = u.pathname || '';
		  if (pathname === '/game' || pathname === '/game/tournament') {
			wss.handleUpgrade(req, socket, head, (ws) => {
			  (ws as any).__pathname = pathname;
			  wss.emit('connection', ws, req);
			});
		  } else {
			socket.destroy();
		  }
		});
		
		/* ==========================================
		1v1 EN LIGNE (identique à ton original)
		========================================== */
		const rooms: Room[] = [];
		let pending: ClientInfo | null = null;
		
		function broadcast(room: Room, obj: any) {
			const s = JSON.stringify(obj);
			for (const ci of room.clients) {
				if (ci.ws.readyState === WebSocket.OPEN) ci.ws.send(s);
			}
		}
		
		function safeSend(ws: WebSocket, obj: any) {
			try { ws.send(JSON.stringify(obj)); } catch {}
		}
		
		function createRoom(a: ClientInfo, b: ClientInfo): Room {
			const config: gameConfig = {
				mode: '1v1',
				playerSetup: [
					{ type: 'human', playerId: 1, name: ''},
					{ type: 'human', playerId: 2, name: ''},
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
		
		function endAndCleanupRoom(room: Room, reason: 'game_over'|'opponent_disconnected'|'server_stop') {
			try {
				broadcast(room, { type: 'end', reason });
				try { (room.engine as any)?.dispose?.(); } catch {}
				try { room.engine.changeStatus(false); } catch {}
				
				const idx = rooms.indexOf(room);
				if (idx !== -1) rooms.splice(idx, 1);
				
				for (const ci of room.clients) {
					try { ci.ws.close(); } catch {}
				}
			} catch {}
		}
		
		/* ==========================================
		TOURNOI LOCAL (séquentiel) sur /game/tournament
		========================================== */
		function normalizeEngineKey(code?: string, key?: string): string | null {
			
			if (code === 'ArrowUp' || key === 'ArrowUp')     return 'ArrowUp';
			if (code === 'ArrowDown' || key === 'ArrowDown') return 'ArrowDown';
			
			if (code === 'KeyW' || key === 'z' || key === 'Z') return 'z';
			if (code === 'KeyS' || key === 's' || key === 'S') return 's';
			return null;
		}
		
		function startLocalTicker(sess: LocalSession) {
			if (sess.ticker) clearInterval(sess.ticker);
			const FRAME_MS = 1000 / 60;
			
			sess.ticker = setInterval(() => {
				if (!sess.t) return;
				if (sess.awaitingContinue)
					return;     // ⛔ gel
				
				const snap: GameState = sess.t.playLocal?.();
				if (snap.running === false) {
					maybeSendTournamentSummary(snap, sess);
				}
				
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
   wss.on('connection', (ws: WebSocket, req)=> {
     const pathname = (ws as any).__pathname as string;
   
     // ---------- 1) 1v1 en ligne ----------
     if (pathname === '/game') {
       const client: ClientInfo = { ws, role: 'left', lastDir: 'stop' };
       
       if (!pending) {
         client.role = 'left';
         pending = client;
         ws.send(JSON.stringify({ type: 'waiting', role: 'left' }));
       } else {
         client.role = 'right';
         const a = pending; pending = null;
         createRoom(a!, client);
       }
       
       ws.on('message', (raw: RawData) => {
         try {
           const msg = JSON.parse(raw.toString());
           if (msg.type === 'input') {
             for (const room of rooms) {
               const ci = room.clients.find(c => c.ws === ws);
               if (ci) { ci.lastDir = msg.dir as Dir; break; }
             }
           }
         } catch {}
       });
   
       ws.on('close', () => {
         if (pending && pending.ws === ws) { pending = null; return; }
   
         for (let i = rooms.length - 1; i >= 0; i--) {
           const r = rooms[i];
           const idx = r.clients.findIndex(c => c.ws === ws);
           if (idx !== -1) {
             const survivor = r.clients[1 - idx];
             safeSend(survivor.ws, { type: 'info', code: 'opponent_disconnected' });
             try { r.engine.changeStatus(false); } catch {}
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
     if (pathname === '/game/tournament') {
       const sess: LocalSession = { ws, t: null, tournamentId: uuidv4(), historTournmnt: []};
      safeSend(ws, { type: 'info', code: 'waiting_conf' });

      sess.userId = 'sdd';
      ws.on('message', async (raw: RawData) => {
      let msg: any;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
   
      switch (msg.type) {
        case 'conf': {
          const conf = msg.config as buildTournament;

          if (!conf || !Array.isArray(conf.players)) {
            safeSend(ws, { type: 'info', code: 'conf_invalid' });
            return;
          }
   
          try {
            sess.t = new Tournament(CANVAS_W, CANVAS_H, conf);
            safeSend(ws, { type: 'start', w: CANVAS_W, h: CANVAS_H });
            startLocalTicker(sess);
          } catch (e) {
            console.error('LocalTournament init error:', e);
            safeSend(ws, { type: 'info', code: 'conf_error' });
          }
          break;
          }
   
          case 'key': {
            if (!sess.t) return;
            const code = msg.code as string | undefined;
            const key  = msg.key  as string | undefined;
            const isPressed = !!msg.isPressed;
   
            const norm = normalizeEngineKey(code, key);
            if (!norm) return;
   
            try { (sess.t as any).redirectTournament?.(norm, isPressed); } catch {}
            break;
          }
          case 'continue': {
            if (!sess.t || !sess.awaitingContinue) break;
             // Dé-gèle
             sess.awaitingContinue = false;
             sess.t.launch = true;
             // 👇 Kick immédiat : recalcule un frame et renvoie un state tout de suite
             try {
               const snap = (sess.t as any).playLocal?.();
               if (snap) safeSend(sess.ws, { type: 'state', state: snap });
             } catch {}

             break;
           }
           case 'info_players': {
             try {
               if (sess.t) {
                 const res = sess.t.getNextMatch(); 
                 const player1 = res[0];
                 const player2 = res[1] ?? 'WINNER';
                 if (!player1)
                 {
                  const body = {
                    tournamentId: String(sess.tournamentId),
                    userId: String("b95300c9-9cb5-467a-a26c-f5609c19959c"), // remplace par le vrai
                    winnerName: String(player2 ?? 'WINNER').trim().slice(0,20),
                    matches: (sess.historTournmnt ?? []).map(m => ({
                      player1: {
                        name: String(m.player1?.name ?? '').slice(0,20),
                        score: Number(m.player1?.score ?? NaN),
                      },
                      player2: {
                        name: String(m.player2?.name ?? '').slice(0,20),
                        score: Number(m.player2?.score ?? NaN),
                      },
                    })),
                  };

                  // garde un garde-fou local
                  if (!body.winnerName) throw new Error('winnerName manquant');
                  if (!Array.isArray(body.matches) || body.matches.length === 0) throw new Error('matches vide');
                  for (const mat of body.matches) {
                    if (!Number.isFinite(mat.player1.score) || !Number.isFinite(mat.player2.score)) {
                      throw new Error('score non numérique dans matches');
                    }
                  }

                  try {
                    safeSend(sess.ws, { type: 'tournament_end' });
                    clearInterval(sess.ticker!);
                    sess.ticker = undefined;
                    await sendTournamentData(body);
                  } catch (err) {
                    console.error("❌ Erreur POST /tournaments/summary :", err);
                  }
                   break;
                 }     
                 const player = `${player1} VS ${player2}`;
           
                 safeSend(sess.ws, { type: 'info_players', player });
               }
             } catch (err) {
               console.error('info_players error', err);
             }
             break;
           }        
           default: break;
         }
       });
   
       ws.on('close', () => {
         if (sess.ticker) clearInterval(sess.ticker);
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
     const endedRooms: Room[] = [];
   
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
         if (!db)
           initDB(); // il faut initialiser la DB au démarrage
         const data_match = room.engine.getGameState();
         console.log('NAME PLAYER 1: ', data_match.paddles[0]?.name)         
         console.log('NAME PLAYER 2: ', data_match.paddles[1]?.name)
         const playerA = data_match.paddles[0]?.name || 'Player 1';
         const playerB = data_match.paddles[1]?.name || 'Player 2';
         const scoreA = Number(data_match.scores.A);
         const scoreB = Number(data_match.scores.B);
         
         const didAWin = scoreA > scoreB;
         const winner = didAWin ? playerA : playerB;
         const loser = didAWin ? playerB : playerA;
         const winnerScore = didAWin ? scoreA : scoreB;
         const loserScore = didAWin ? scoreB : scoreA;
         saveMatch({
           winner,
           loser,
           winnerScore,
           loserScore,
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
         if (!room.engine.getStatus()) continue;
         const snapshot = room.engine.getSnapshot();
         const payload = JSON.stringify({ type: 'state', snapshot });
         for (const ci of room.clients) {
           if (ci.ws.readyState === WebSocket.OPEN) ci.ws.send(payload);
         }
       }
     }
   
     // Cleanup rooms finies
     for (const r of endedRooms) {
       try {
         const finalSnap = r.engine.getSnapshot();
         broadcast(r, { type: 'state', snapshot: finalSnap });
       } catch {}
       endAndCleanupRoom(r, 'game_over');
     }
   }, TICK_MS);
   
   /* =========
      Envoi Mat
      ========= */
   
     // Appelle ceci dans ton onState / quand snap.running devient false
   async function maybeSendTournamentSummary(snap: GameState, sess: LocalSession) {
     try {
       if (!snap)
         return;
   
       const nameA = (snap.paddles[0]?.name) || 'Player 1';
       const nameB = (snap.paddles[1]?.name) || 'Player 2';
       const scoreA = snap.scores.A;
       const scoreB = snap.scores.B
   
       const payload: Payload = {
             player1: { name: nameA, score: scoreA },
             player2: { name: nameB, score: scoreB },
       };
   
       sess.historTournmnt.push(payload);
     } catch (err) {
       console.error('[summary] Erreur envoi tournoi:', err);
     }
   }
}