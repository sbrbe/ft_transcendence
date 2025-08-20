import { Paddle } from './paddle.js';
import { Ball } from './ball.js';

export class CPU {
  public name: string = "CPU";
  public paddle: Paddle;
  public gameMode: string
  private limitTop: number;
  private limitBot: number;
  private lastDecisionTime: number = 0;
  private YImpact :number = -1;
  public kk: { up: string, down: string };
  public input: Record<string, boolean>;

  constructor(paddle: Paddle, mode: string, indexPaddle: number, canvasHeight: number,keys: { up: string, down: string }) 
  {
    console.log(canvasHeight);
    
    this.paddle = paddle;
    this.gameMode = mode;
    this.kk = keys;
    this.input = { [keys.up]: false, [keys.down]: false };
    if (mode == '2v2')
    {
      if (indexPaddle == 0 || indexPaddle == 3)
      {
        this.limitTop = 0;
        this.limitBot = (canvasHeight/2);
      } 
      else 
      {
        this.limitTop = canvasHeight/2
        this.limitBot = canvasHeight;
      }
    } 
    else 
    {
      this.limitTop = 0
      this.limitBot = canvasHeight;
    }
    console.log("CPU index ",indexPaddle, "ltop ",this.limitTop, "lbot ",this.limitBot);
  }

  private simulateKey(up: boolean, down: boolean) 
  {
    this.input[this.kk.up] = up;
    this.input[this.kk.down] = down;
  }

  public predictBall(ball: Ball, canvasHeight: number) : number
  {
    if ((ball.vx > 0) === (this.paddle.x > ball.x))
    {
      const distX = this.paddle.x - (ball.x + ball.width /2);
      const timeImpact = distX / ball.vx;
      const projectedY = (ball.y + ball.height / 2) + ball.vy * timeImpact;
      let foldedY = projectedY % (2*canvasHeight); // cycle comme une onde
      if (foldedY < 0)
        foldedY *= -1;
      if (foldedY <= canvasHeight)
        return foldedY;
      else
        return (canvasHeight*2) - foldedY;
    }
    return -1;
  }

  public handleInput(speed: number) 
  {
    if (this.input[this.kk.up])
      this.paddle.y -= speed;
    if (this.input[this.kk.down])
      this.paddle.y += speed;
    this.paddle.y = Math.max(this.limitTop,Math.min(this.limitBot-this.paddle.height, this.paddle.y));
  }
 
  public update(ball: Ball, canvasHeight: number) 
  {
    const currentTime :number = performance.now();
    let speed :number = 9;

    if (currentTime - this.lastDecisionTime >= 1000)
    {
      this.lastDecisionTime = currentTime;
      this.YImpact = this.predictBall(ball, canvasHeight);
    }

    const paddleCenter = this.paddle.y + this.paddle.height/ 2;
    
    if (this.YImpact != -1)
    {
      const ballCenter = this.YImpact; 
      if (ballCenter < this.paddle.y) 
       this.simulateKey(true,false);
      else if (ballCenter > this.paddle.y + this.paddle.height) 
       this.simulateKey(false,true);
      else{this.simulateKey(false,false);}
    }
    else
    {
      const base = (this.limitBot + this.limitTop)/2;
      speed = 1;
      if (paddleCenter < base)
        this.simulateKey(false,true);
      else if (paddleCenter > base)
        this.simulateKey(true,false);
      else
        this.simulateKey(false,false);
    }
    this.handleInput(speed)
  }
}