export class OnlineClient {
    constructor(onState, onInfo) {
        this.onState = onState;
        this.onInfo = onInfo;
        this.ws = null;
        this.lastSnapshot = null;
        this.role = 'left';
    }
    connect() {
        this.ws = new WebSocket(`wss://${location.host}/ws`); // ← sans slash final
        this.ws.addEventListener('message', (e) => {
            const msg = JSON.parse(e.data);
            if (msg.type === 'waiting') {
                this.role = msg.role;
                this.onInfo?.(msg);
            }
            else if (msg.type === 'start') {
                this.role = msg.role;
                this.onInfo?.(msg);
            }
            else if (msg.type === 'state') {
                this.lastSnapshot = msg.snapshot;
                this.onState(this.lastSnapshot);
            }
        });
    }
    sendDir(dir) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
            return; // ← ici
        this.ws.send(JSON.stringify({ type: 'input', dir }));
    }
    getSnapshot() { return this.lastSnapshot; }
    getRole() { return this.role; }
    dispose() {
        try {
            this.ws?.close();
        }
        catch { }
        this.ws = null;
        this.lastSnapshot = null; // ⬅️ important
    }
}
