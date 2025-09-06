import { buildTournament } from "../../../../shared/engine_play/src/tournament_logic";

export class OnlineClient {
  private ws: WebSocket | null = null;
  private lastSnapshot: any = null;
  private role: 'left'|'right' = 'left';
  private onState: (snap: any) => void;
  private onInfo?: (msg: any) => void;
  private openPromise: Promise<void> | null = null;
  private endpoint: string;
  private pressed = { up: false, down: false };

  constructor(
    onState: (snap: any) => void,
    onInfo?: (msg: any) => void,
    endpoint = '/game'
  ) {
    this.onState = onState;
    this.onInfo = onInfo;
    this.endpoint = endpoint;
  }

  private isOneVsOne() {
    return this.endpoint === '/game';
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return Promise.resolve();
    this.ws = new WebSocket(`wss://${location.host}${this.endpoint}`);
    this.openPromise = new Promise<void>((resolve) => {
      this.ws!.addEventListener('open', () => resolve(), { once: true });
    });

    this.ws.addEventListener('message', (ev) => {
      let msg: any;
      try { msg = JSON.parse(ev.data); } catch { return; }

      if (msg.type === 'state') {
        const snap = msg.state ?? msg.snapshot ?? msg;
        this.onState(snap);
      } else if (
        msg.type === 'info' ||
        msg.type === 'start' ||
        msg.type === 'end' ||
        msg.type === 'tournament_end' ||
        msg.type === 'waiting'
      ) {
        this.onInfo?.(msg);
      } else if (typeof msg?.running === 'boolean') {
        this.onState(msg);
      }
    });
    this.ws.addEventListener('close', () => { this.ws = null; this.pressed.up = this.pressed.down = false; });
    this.ws.addEventListener('error', () => { try { this.ws?.close(); } catch {} this.ws = null; });

    return this.openPromise!;
  }

  // ====== PATCH ICI ======
  sendKey(code: string, isPressed: boolean) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    if (this.isOneVsOne()) {
      // 1v1 : on convertit ArrowUp/ArrowDown en dir
      if (code === 'ArrowUp')   this.pressed.up = isPressed;
      if (code === 'ArrowDown') this.pressed.down = isPressed;

      let dir: 'up'|'down'|'stop' = 'stop';
      if (this.pressed.up && !this.pressed.down) dir = 'up';
      else if (this.pressed.down && !this.pressed.up) dir = 'down';
      else dir = 'stop';

      this.ws.send(JSON.stringify({ type: 'input', dir }));
      return;
    }

    this.ws.send(JSON.stringify({ type: 'key', code, isPressed }));
  }

  sendDir(dir: 'up'|'down'|'stop') {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: 'input', dir }));
  }

  sendContinue() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: 'continue' }));
  }
  
  sendInfoPlayers(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        resolve(null);
        return;
      }
  
      const listener = (ev: MessageEvent) => {
        let msg: any;
        try { msg = JSON.parse(ev.data); } catch { return; }
        if (msg.type === 'info_players') {
          this.ws?.removeEventListener('message', listener);
          resolve(msg.player ?? null);
        }
      };
      this.ws.addEventListener('message', listener);
  
      this.ws.send(JSON.stringify({ type: 'info_players' }));
    });
  }
  

  sendConfTournament(config: buildTournament) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: 'conf', config }));
  }

  sendConf1vs1(playerInfo: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: '1vs1', playerInfo}));
  }

  getSnapshot() { return this.lastSnapshot; }
  getRole() { return this.role; }
  dispose() {
    try { this.ws?.close(); } catch {}
    this.ws = null;
    this.lastSnapshot = null;
    this.pressed.up = this.pressed.down = false;
  }
}
