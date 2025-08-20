export class Player {
    constructor(paddle, keys, opts) {
        this.onKeyDown = (e) => {
            if (this.source === 'synthetic' && e.isTrusted)
                return; // refuse physique
            if (e.key in this.input) {
                this.input[e.key] = true;
                if (e.isTrusted && (e.key === this.keys.up || e.key === this.keys.down))
                    e.preventDefault?.();
            }
        };
        this.onKeyUp = (e) => {
            if (this.source === 'synthetic' && e.isTrusted)
                return;
            if (e.key in this.input) {
                this.input[e.key] = false;
                if (e.isTrusted && (e.key === this.keys.up || e.key === this.keys.down))
                    e.preventDefault?.();
            }
        };
        this.onBlur = () => {
            this.input[this.keys.up] = false;
            this.input[this.keys.down] = false;
        };
        this.paddle = paddle;
        this.keys = keys;
        this.input = { [keys.up]: false, [keys.down]: false };
        this.source = opts?.source ?? 'any';
        window.addEventListener('keydown', this.onKeyDown, { passive: false });
        window.addEventListener('keyup', this.onKeyUp, { passive: false });
        window.addEventListener('blur', this.onBlur);
    }
    destroy() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('blur', this.onBlur);
    }
    /**
     * Ne déplace plus la raquette lui‑même : il fournit seulement l'intention.
     */
    currentIntent() {
        return {
            up: !!this.input[this.keys.up],
            down: !!this.input[this.keys.down],
        };
    }
    /** Input direct côté humain (via GameApp) */
    onHumanInput(key, isPressed) {
        if (this.source !== 'human')
            return; // refuse si IA
        if (key === this.keys.up || key === this.keys.down)
            this.input[key] = isPressed;
    }
}
