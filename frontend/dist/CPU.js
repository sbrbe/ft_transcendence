export class CPU {
    constructor(paddle, mode, indexPaddle, canvasHeight, keys, keyboardAdapter) {
        this.keyboardAdapter = keyboardAdapter;
        this.name = "CPU";
        this.lastKey = null;
        this.nextDecisionMs = 0;
        this.decideEveryMs = 1000; // ← on garde 1 seconde
        this.cachedTargetY = null;
        this.cachedDeadlineMs = 0;
        this.paddle = paddle;
        this.keys = keys;
        this.nextDecisionMs = performance.now();
        this.gameMode = mode;
        if (mode == '2v2') {
            if (indexPaddle == 0 || indexPaddle == 3) {
                this.limitTop = 0;
                this.limitBot = (canvasHeight / 2) - paddle.height;
            }
            else {
                this.limitTop = canvasHeight / 2;
                this.limitBot = canvasHeight - paddle.height;
            }
        }
        else {
            this.limitTop = 0;
            this.limitBot = canvasHeight - paddle.height;
        }
    }
    // helpers limites demi-terrain (ajout minimal)
    canMoveUp() { return this.paddle.y > this.limitTop; }
    canMoveDown() { return this.paddle.y < this.limitBot; }
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
            this.keyboardAdapter.pressSynthetic(this.lastKey, false);
            this.lastKey = null;
        }
    }
    update(ball, canvasHeight) {
        const now = performance.now();
        if (now >= this.nextDecisionMs) {
            do {
                this.nextDecisionMs += this.decideEveryMs;
            } while (now >= this.nextDecisionMs);
            const impact = this.predictBall(ball, canvasHeight); // -1 si s'éloigne
            let desired = null;
            let targetY;
            if (impact !== -1) {
                targetY = impact;
                this.cachedTargetY = impact;
            }
            else {
                targetY = canvasHeight / 2;
            }
            const paddleCenter = this.paddle.y + this.paddle.height / 2;
            // blocs d’origine conservés (simulation clavier inchangée)
            if (impact != -1) {
                const speed = 7;
                const ballCenter = impact + ball.height / 2;
                if (ballCenter < this.paddle.y) {
                    if (desired !== this.lastKey) {
                        if (this.lastKey)
                            this.keyboardAdapter.pressSynthetic(this.lastKey, false);
                        if (desired)
                            this.keyboardAdapter.pressSynthetic(desired, true);
                        this.lastKey = desired;
                    }
                }
                else if (ballCenter > paddleCenter + 10) {
                    if (desired !== this.lastKey) {
                        if (this.lastKey)
                            this.keyboardAdapter.pressSynthetic(this.lastKey, false);
                        if (desired)
                            this.keyboardAdapter.pressSynthetic(desired, true);
                        this.lastKey = desired;
                    }
                }
            }
            else {
                const speed = 1;
                const base = (this.limitBot + this.limitTop) / 2;
                if (paddleCenter == base)
                    return;
                if (paddleCenter < base)
                    if (desired !== this.lastKey) {
                        if (this.lastKey)
                            this.keyboardAdapter.pressSynthetic(this.lastKey, false);
                        if (desired)
                            this.keyboardAdapter.pressSynthetic(desired, true);
                        this.lastKey = desired;
                    }
                    else if (paddleCenter > base)
                        if (desired !== this.lastKey) {
                            if (this.lastKey)
                                this.keyboardAdapter.pressSynthetic(this.lastKey, false);
                            if (desired)
                                this.keyboardAdapter.pressSynthetic(desired, true);
                            this.lastKey = desired;
                        }
            }
            const dead = Math.max(6, this.paddle.speed);
            const dist = targetY - paddleCenter;
            desired = (Math.abs(dist) > dead) ? (dist > 0 ? 'down' : 'up') : null;
            // 🔒 garde la raquette dans sa moitié
            if (desired === 'up' && !this.canMoveUp())
                desired = null;
            if (desired === 'down' && !this.canMoveDown())
                desired = null;
            // ✅ on réactive le press/release proprement (simulation clavier)
            if (desired !== this.lastKey) {
                if (this.lastKey)
                    this.keyboardAdapter.pressSynthetic(this.lastKey, false);
                if (desired)
                    this.keyboardAdapter.pressSynthetic(desired, true);
                this.lastKey = desired;
            }
            // deadline de sécu (inchangé)
            const distX = Math.abs(this.paddle.x - (ball.x + ball.width / 2));
            const timeToReachMs = (ball.vx !== 0) ? Math.max(0, (distX / Math.abs(ball.vx)) * 1000) : 0;
            this.cachedDeadlineMs = now + Math.min(this.decideEveryMs, Math.max(300, timeToReachMs + 120));
        }
        // stops locaux (inchangés) + relâche si bord atteint
        if (this.lastKey) {
            const paddleCenter = this.paddle.y + this.paddle.height / 2;
            const dead = Math.max(6, this.paddle.speed);
            if (this.cachedTargetY !== null) {
                const dist = this.cachedTargetY - paddleCenter;
                if (Math.abs(dist) <= dead)
                    this.release();
            }
            if (now >= this.cachedDeadlineMs)
                this.release();
            // relâche si on touche le bord de la moitié
            if (this.paddle.y <= this.limitTop && this.lastKey === 'up')
                this.release();
            if (this.paddle.y >= this.limitBot && this.lastKey === 'down')
                this.release();
        }
    }
}
