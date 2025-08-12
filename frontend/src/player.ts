// Player.ts
import { Paddle } from './paddle';
import { Ball } from './ball';

type InputSource = 'human' | 'synthetic' | 'any';

export class Player {
  public paddle: Paddle;
  private keys: { up: string; down: string };
  private input: Record<string, boolean>;
  private source: InputSource;

  private onKeyDown = (e: KeyboardEvent) => {
    // 🔎 Filtrage selon la source
    if (this.source === 'synthetic' && e.isTrusted) return;    // refuse physique

    if (e.key in this.input) {
      this.input[e.key] = true;
      // évite scroll (utile côté humain)
      if (e.isTrusted && (e.key === this.keys.up || e.key === this.keys.down)) e.preventDefault?.();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (this.source === 'synthetic' && e.isTrusted) return;

    if (e.key in this.input) {
      this.input[e.key] = false;
      if (e.isTrusted && (e.key === this.keys.up || e.key === this.keys.down)) e.preventDefault?.();
    }
  };

  private onBlur = () => {
    this.input[this.keys.up] = false;
    this.input[this.keys.down] = false;
  };

  constructor(paddle: Paddle, keys: { up: string; down: string }, opts?: { source?: InputSource }) {
    this.paddle = paddle;
    this.keys = keys;
    this.input = { [keys.up]: false, [keys.down]: false };
    this.source = opts?.source ?? 'any'; // par défaut: accepte tout (si tu veux)

    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('keyup', this.onKeyUp, { passive: false });
    window.addEventListener('blur', this.onBlur);
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }

  public update(_ball: Ball, canvasHeight: number) {
    if (this.input[this.keys.up] && this.paddle.y > 0) {
      this.paddle.moove(-this.paddle.speed);
    } else if (this.input[this.keys.down] && (this.paddle.y + this.paddle.height < canvasHeight)) {
      this.paddle.moove(this.paddle.speed);
    }
  }

  // + ajoute ceci dans Player
public onHumanInput(key: string, isPressed: boolean) {
  if (this.source !== 'human') return;            // ← refuse si IA
  if (key === this.keys.up || key === this.keys.down) {
    this.input[key] = isPressed;
  }
}

}
