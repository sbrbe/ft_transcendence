import { Paddle } from './paddle.js';
import { Ball } from './ball.js';

export class Player {
  public id : string;
  public name: string;
  public paddle: Paddle;
  public keys: { up: string, down: string };
  public input: Record<string, boolean>;

  constructor(paddle: Paddle, keys: { up: string, down: string }, name: string, id :string = '0') {
    this.paddle = paddle;
    this.keys = keys;
    this.input = { [keys.up]: false, [keys.down]: false };
    this.id = id;
    this.name = name;
  }

  public update(ball: Ball, canvasHeight: number) {
    if (this.input[this.keys.up] && this.paddle.y > 0) {
      this.paddle.moove(-1);
    } else if (this.input[this.keys.down] && (this.paddle.y + this.paddle.height < canvasHeight)) {
      this.paddle.moove(1);
    }
  }
}