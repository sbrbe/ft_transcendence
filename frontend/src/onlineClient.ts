export class OnlineClient {
  private ws: WebSocket | null = null;
  private lastSnapshot: any = null;
  private role: 'left'|'right' = 'left';

  constructor(private onState: (snap:any)=>void, private onInfo?: (msg:any)=>void) {}

  connect() {
    this.ws = new WebSocket(`wss://${location.host}/ws?ch=game`); // ← sans slash final
    
    this.ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'waiting') {
        this.role = msg.role;
        this.onInfo?.(msg);
      } else if (msg.type === 'start') {
        this.role = msg.role;
        this.onInfo?.(msg);
      } else if (msg.type === 'state') {
        this.lastSnapshot = msg.snapshot;
        this.onState(this.lastSnapshot);
      }
    });
  }

  sendDir(dir: 'up'|'down'|'stop') {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return; // ← ici
    this.ws.send(JSON.stringify({ type: 'input', dir }));
  }
  

  getSnapshot() { return this.lastSnapshot; }
  getRole() { return this.role; }
  dispose() {
    try { this.ws?.close(); } catch {}
    this.ws = null;
    this.lastSnapshot = null;   // ⬅️ important
  }
  
}


// document.getElementById('list')?.addEventListener('click', async (e) => {
//   const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.joinBtn');
//   if (!btn) return;

//   const id = btn.dataset.id!;
//   console.log("Tu as cliqué sur le tournoi:", id);

//   // 1) rejoindre (renvoie { tournamentId, playerId, slotIndex })
//   const joined = await this.joinTournament(id);
//   if (!joined) return; // join a échoué

//   // 2) récupérer l’état complet du tournoi
//   const tRes = await fetch(`/ws/tournaments/${id}`);
//   if (!tRes.ok) {
//     console.error('GET /tournaments/:id failed', tRes.status, await tRes.text());
//     return;
//   }
//   const t = await tRes.json(); // doit contenir { id,name,size,slots,... }
//   // 3) afficher le lobby
//   this.showView('tournament-lobby');
//   this.renderLobby(t);
// });

