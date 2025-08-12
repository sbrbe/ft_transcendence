export class Player {
    constructor(paddle, keys, opts) {
        var _a;
        this.onKeyDown = (e) => {
            var _a;
            // 🔎 Filtrage selon la source
            if (this.source === 'synthetic' && e.isTrusted)
                return; // refuse physique
            if (e.key in this.input) {
                this.input[e.key] = true;
                // évite scroll (utile côté humain)
                if (e.isTrusted && (e.key === this.keys.up || e.key === this.keys.down))
                    (_a = e.preventDefault) === null || _a === void 0 ? void 0 : _a.call(e);
            }
        };
        this.onKeyUp = (e) => {
            var _a;
            if (this.source === 'synthetic' && e.isTrusted)
                return;
            if (e.key in this.input) {
                this.input[e.key] = false;
                if (e.isTrusted && (e.key === this.keys.up || e.key === this.keys.down))
                    (_a = e.preventDefault) === null || _a === void 0 ? void 0 : _a.call(e);
            }
        };
        this.onBlur = () => {
            this.input[this.keys.up] = false;
            this.input[this.keys.down] = false;
        };
        this.paddle = paddle;
        this.keys = keys;
        this.input = { [keys.up]: false, [keys.down]: false };
        this.source = (_a = opts === null || opts === void 0 ? void 0 : opts.source) !== null && _a !== void 0 ? _a : 'any'; // par défaut: accepte tout (si tu veux)
        window.addEventListener('keydown', this.onKeyDown, { passive: false });
        window.addEventListener('keyup', this.onKeyUp, { passive: false });
        window.addEventListener('blur', this.onBlur);
    }
    destroy() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('blur', this.onBlur);
    }
    update(_ball, canvasHeight) {
        if (this.input[this.keys.up] && this.paddle.y > 0) {
            this.paddle.moove(-this.paddle.speed);
        }
        else if (this.input[this.keys.down] && (this.paddle.y + this.paddle.height < canvasHeight)) {
            this.paddle.moove(this.paddle.speed);
        }
    }
    // + ajoute ceci dans Player
    onHumanInput(key, isPressed) {
        if (this.source !== 'human')
            return; // ← refuse si IA
        if (key === this.keys.up || key === this.keys.down) {
            this.input[key] = isPressed;
        }
    }
}
