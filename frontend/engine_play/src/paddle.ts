import { Ball } from "./ball";


export class Paddle {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public color: string,
    public speed = 9 ,
  ) {}

  moove(dir: number): void {
	  this.y += dir*this.speed;
  }
  interaction(ball: Ball)
  {
    const bHitY: number = ball.y + ball.height/2;
    const pddCenter: number = this.y + this.height/2;
    let normalizeContact = (bHitY - pddCenter) / (this.height / 2);  

    normalizeContact = Math.max(-1, Math.min(1, normalizeContact));
    const angle = normalizeContact * ( Math.PI / 3);
    let vect = ball.vx < 0 ?   1 :  -1;
    ball.vx = (Math.cos(angle) * ball.speed) * vect;
    ball.vy = Math.sin(angle) * ball.speed;
  }
}