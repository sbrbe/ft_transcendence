export class CPU {
    constructor(paddle, keys) {
        this.lastKey = null;
        this.nextDecisionMs = 0;
        this.decideEveryMs = 1000;
        // 🔹 NEW: on garde la cible et une deadline
        this.cachedTargetY = null;
        this.cachedDeadlineMs = 0;
        this.paddle = paddle;
        this.keys = keys;
        // DÉCISION IMMÉDIATE
        this.nextDecisionMs = performance.now();
    }
    triangleFold(y, H) {
        let m = y % (2 * H);
        if (m < 0)
            m += 2 * H;
        return (m <= H) ? m : (2 * H - m);
    }
    predictBall(ball, canvasHeight) {
        if ((ball.vx > 0) === (this.paddle.x > ball.x)) {
            const distX = this.paddle.x - (ball.x + ball.width / 2);
            const t = distX / ball.vx;
            const projY = (ball.y + ball.height / 2) + ball.vy * t;
            return this.triangleFold(projY, canvasHeight);
        }
        return -1;
    }
    resetTime() {
        this.nextDecisionMs = performance.now();
    }
    release() {
        if (this.lastKey) {
            const prev = this.lastKey === 'up' ? this.keys.up : this.keys.down;
            window.dispatchEvent(new KeyboardEvent('keyup', { key: prev }));
            this.lastKey = null;
        }
    }
    update(ball, canvasHeight) {
        const now = performance.now();
        // 1) Tick 1 Hz (horaire fixe)
        if (now >= this.nextDecisionMs) {
            do {
                this.nextDecisionMs += this.decideEveryMs;
            } while (now >= this.nextDecisionMs);
            console.log('1seconde');
            // === Décision ===
            const impact = this.predictBall(ball, canvasHeight); // -1 si balle s'éloigne
            let desired = null;
            // Choix de la cible même si impact === -1
            let targetY = null;
            if (impact !== -1) {
                targetY = impact;
                this.cachedTargetY = impact; // mémoriser la cible “utile”
            }
            else {
                // OPTION 1 : recentrage
                targetY = canvasHeight / 2;
                // OPTION 2 (au lieu de recentrage) :
                // targetY = this.cachedTargetY ?? canvasHeight / 2;
            }
            // Deadline
            const distX = Math.abs(this.paddle.x - (ball.x + ball.width / 2));
            const timeToReachMs = (ball.vx !== 0) ? Math.max(0, (distX / Math.abs(ball.vx)) * 1000) : 0;
            // limite entre 300 ms et 1000 ms pour éviter des maintiens trop longs
            this.cachedDeadlineMs = now + Math.min(this.decideEveryMs, Math.max(300, timeToReachMs + 120));
            // Calcul de la touche à maintenir vs targetY (même algo qu’avant)
            const paddleCenter = this.paddle.y + this.paddle.height / 2;
            const dead = Math.max(6, this.paddle.speed);
            const dist = (targetY - paddleCenter);
            desired = (Math.abs(dist) > dead) ? (dist > 0 ? 'down' : 'up') : null;
            // Appliquer changement de touche
            if (desired !== this.lastKey) {
                if (this.lastKey) {
                    const prev = this.lastKey === 'up' ? this.keys.up : this.keys.down;
                    window.dispatchEvent(new KeyboardEvent('keyup', { key: prev }));
                }
                if (desired) {
                    const next = desired === 'up' ? this.keys.up : this.keys.down;
                    window.dispatchEvent(new KeyboardEvent('keydown', { key: next }));
                }
                this.lastKey = desired;
            }
        }
        // 2) Entre deux ticks : stops locaux (dead‑zone / deadline)
        if (this.lastKey) {
            const paddleCenter = this.paddle.y + this.paddle.height / 2;
            // Si on a une cible mémorisée, on s’arrête en arrivant dans la fenêtre
            const dead = Math.max(6, this.paddle.speed);
            if (this.cachedTargetY !== null) {
                const dist = this.cachedTargetY - paddleCenter;
                if (Math.abs(dist) <= dead)
                    this.release();
            }
            // Sécurité temps
            if (now >= this.cachedDeadlineMs)
                this.release();
        }
    }
}
