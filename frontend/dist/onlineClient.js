export class OnlineClient {
    constructor(onState, onInfo, endpoint = '/ws' // 👈 par défaut 1v1, tu mettras '/ws/local' pour tournoi local
    ) {
        this.ws = null;
        this.lastSnapshot = null;
        this.role = 'left';
        this.openPromise = null;
        // garde l'état des touches pour décider 'stop'/'up'/'down'
        this.pressed = { up: false, down: false };
        this.onState = onState;
        this.onInfo = onInfo;
        this.endpoint = endpoint;
    }
    isOneVsOne() {
        return this.endpoint === '/ws';
    }
    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN)
            return Promise.resolve();
        const proto = location.protocol === 'https:' ? 'wss' : 'ws';
        this.ws = new WebSocket(`${proto}://${location.host}${this.endpoint}`);
        this.openPromise = new Promise((resolve) => {
            this.ws.addEventListener('open', () => resolve(), { once: true });
        });
        this.ws.addEventListener('message', (ev) => {
            let msg;
            try {
                msg = JSON.parse(ev.data);
            }
            catch {
                return;
            }
            if (msg.type === 'state') {
                const snap = msg.state ?? msg.snapshot ?? msg;
                this.onState(snap);
            }
            else if (msg.type === 'info' ||
                msg.type === 'start' ||
                msg.type === 'end' ||
                msg.type === 'tournament_end' ||
                msg.type === 'waiting') {
                this.onInfo?.(msg);
            }
            else if (typeof msg?.running === 'boolean') {
                this.onState(msg);
            }
        });
        this.ws.addEventListener('close', () => { this.ws = null; this.pressed.up = this.pressed.down = false; });
        this.ws.addEventListener('error', () => { try {
            this.ws?.close();
        }
        catch { } this.ws = null; });
        return this.openPromise;
    }
    // ====== PATCH ICI ======
    sendKey(code, isPressed) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
            return;
        if (this.isOneVsOne()) {
            // 1v1 : on convertit ArrowUp/ArrowDown en dir
            if (code === 'ArrowUp')
                this.pressed.up = isPressed;
            if (code === 'ArrowDown')
                this.pressed.down = isPressed;
            let dir = 'stop';
            if (this.pressed.up && !this.pressed.down)
                dir = 'up';
            else if (this.pressed.down && !this.pressed.up)
                dir = 'down';
            else
                dir = 'stop';
            this.ws.send(JSON.stringify({ type: 'input', dir }));
            return;
        }
        // tournoi local : on laisse passer le protocole 'key'
        this.ws.send(JSON.stringify({ type: 'key', code, isPressed }));
    }
    // =======================
    sendDir(dir) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
            return;
        this.ws.send(JSON.stringify({ type: 'input', dir }));
    }
    sendContinue() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
            return;
        this.ws.send(JSON.stringify({ type: 'continue' }));
    }
    sendInfoPlayers() {
        return new Promise((resolve) => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                resolve(null);
                return;
            }
            const listener = (ev) => {
                let msg;
                try {
                    msg = JSON.parse(ev.data);
                }
                catch {
                    return;
                }
                if (msg.type === 'info_players') {
                    this.ws?.removeEventListener('message', listener);
                    resolve(msg.player ?? null);
                }
            };
            this.ws.addEventListener('message', listener);
            this.ws.send(JSON.stringify({ type: 'info_players' }));
        });
    }
    sendConfTournament(config) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
            return;
        this.ws.send(JSON.stringify({ type: 'conf', config }));
    }
    getSnapshot() { return this.lastSnapshot; }
    getRole() { return this.role; }
    dispose() {
        try {
            this.ws?.close();
        }
        catch { }
        this.ws = null;
        this.lastSnapshot = null;
        this.pressed.up = this.pressed.down = false;
    }
}
