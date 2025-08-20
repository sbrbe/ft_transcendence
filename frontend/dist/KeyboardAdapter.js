export class KeyboardAdapter {
    constructor(keys, opts, name = "Player") {
        this.onKeyDown = (e) => {
            if (this.source === 'synthetic' && e.isTrusted)
                return;
            if (e.key in this.input) {
                this.input[e.key] = true;
                if (e.isTrusted)
                    e.preventDefault?.();
            }
        };
        this.onKeyUp = (e) => {
            if (this.source === 'synthetic' && e.isTrusted)
                return;
            if (e.key in this.input) {
                this.input[e.key] = false;
                if (e.isTrusted)
                    e.preventDefault?.();
            }
        };
        this.onBlur = () => { this.input[this.keys.up] = false; this.input[this.keys.down] = false; };
        this.keys = keys;
        this.input = { [keys.up]: false, [keys.down]: false };
        this.source = opts?.source ?? 'any';
        window.addEventListener('keydown', this.onKeyDown, { passive: false });
        window.addEventListener('keyup', this.onKeyUp, { passive: false });
        window.addEventListener('blur', this.onBlur);
        this.name = name;
    }
    destroy() { }
    /** Ce que consommera le front pour alimenter le moteur */
    getDirection() {
        if (this.input[this.keys.up] && !this.input[this.keys.down])
            return 'up';
        if (this.input[this.keys.down] && !this.input[this.keys.up])
            return 'down';
        return 'stop';
    }
    /** pour l’app: forcer depuis UI */
    onHumanInput(key, isPressed) {
        if (this.source !== 'human')
            return;
        if (key === this.keys.up || key === this.keys.down)
            this.input[key] = isPressed;
    }
    pressSynthetic(key, pressed) {
        if (this.source !== 'synthetic')
            return;
        const realKey = key === 'up' ? this.keys.up : this.keys.down;
        this.input[realKey] = pressed;
    }
}
