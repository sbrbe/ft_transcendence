import { Paddle } from "./paddle.js";
import { Tracker } from "./tracker.js";

export class Ball {
    public vx: number = 0;
    public vy: number = 0;
    public speed: number = 10;
    public limitspeed: number = 18;
    
    public live: boolean = true;

    constructor (
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public color: string,
    public serviceTo : string, 
    ) {} 
    spawn(): void
    {
        let angle: number;
        this.speed = 10;
        if (!this.live)
        {   
            if (this.serviceTo === 'rigth') {
                angle = randomAngleRad(11 * Math.PI / 6, Math.PI / 6);
            } else {
                angle = randomAngleRad(5 * Math.PI / 6, 7 * Math.PI / 6);
            }
            this.live = true;
        }
        else
        {
            if (Math.random() < 0.5) {
            angle = randomAngleRad(11 * Math.PI / 6, Math.PI / 6);
            } else {
            angle = randomAngleRad(5 * Math.PI / 6, 7 * Math.PI / 6);
            }
        }
        this.launch(angle);
    }
    
    stop() {
    this.vx = 0;
    this.vy = 0;
    }

    launch(angle: number)
    {
        setTimeout(() => {
        this.vx = Math.cos(angle)*this.speed;
        this.vy = Math.sin(angle)*this.speed;
        }, 1500);
        this.stop()
    }

    colisionMultiple(paddles: Paddle[], canvasHeight: number, tracker: Tracker) {
         if (this.y + this.vy <= 0 || this.y + this.height + this.vy >= canvasHeight)
            this.vy *= -1;   
        for (const paddle of paddles) {
            this.colision(paddle, canvasHeight, tracker); 
        }
    }
    colision(paddle: Paddle, canvasHeight: number, tracker: Tracker): void
    {
       this.limitspeed = 20;
        if (paddle.x < this.x)
        {
            if (this.x <= paddle.x +paddle.width && 
                this.y <= paddle.y +paddle.height + 10 &&
                this.y + this.height >= paddle.y - 10)
            {
                paddle.interaction(this);
                tracker.recordHit();
                if (this.speed < this.limitspeed)
                    this.speed+=1;
            }
        }
        else
        {
            if (this.x +this.width >= paddle.x  && 
            this.y <= paddle.y + paddle.height + 10 &&
            this.y + this.height>= paddle.y - 10)
            {
                paddle.interaction(this);
                tracker.recordHit();
                if (this.speed < this.limitspeed)
                    this.speed+=1;
            }
        }
    }

    goal(canvasWidth: number): boolean
    {
        if ((this.x <= 0 )|| (this.x >= (canvasWidth - this.width)))
        {
            if (this.x <= 0)
               this.serviceTo = 'left';
            else
                this.serviceTo = 'rigth';
            this.live = false;
            return true;
        }
        return false;
    }   

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
}
function randomAngleRad(minRad: number, maxRad: number): number 
{
  if (minRad < maxRad) {
    return Math.random() * (maxRad - minRad) + minRad;
  } else {
    const range = 2 * Math.PI - minRad + maxRad;
    const rand = Math.random() * range;
    return (minRad + rand) % (2 * Math.PI);
  }
}