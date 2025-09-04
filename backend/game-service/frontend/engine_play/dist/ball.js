export class Ball {
    constructor(x, y, width, height, color, serviceTo) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.serviceTo = serviceTo;
        this.vx = 0;
        this.vy = 0;
        this.speed = 10;
        this.limitspeed = 18;
        this.live = true;
    }
    spawn() {
        let angle;
        this.speed = 10;
        if (!this.live) {
            if (this.serviceTo === 'rigth') {
                angle = randomAngleRad(11 * Math.PI / 6, Math.PI / 6);
            }
            else {
                angle = randomAngleRad(5 * Math.PI / 6, 7 * Math.PI / 6);
            }
            this.live = true;
        }
        else {
            if (Math.random() < 0.5) {
                angle = randomAngleRad(11 * Math.PI / 6, Math.PI / 6);
            }
            else {
                angle = randomAngleRad(5 * Math.PI / 6, 7 * Math.PI / 6);
            }
        }
        this.launch(angle);
    }
    stop() {
        this.vx = 0;
        this.vy = 0;
    }
    launch(angle) {
        setTimeout(() => {
            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
        }, 1500);
        this.stop();
    }
    colisionMultiple(paddles, canvasHeight, tracker) {
        if (this.y + this.vy <= 0 || this.y + this.height + this.vy >= canvasHeight)
            this.vy *= -1;
        for (const paddle of paddles) {
            this.colision(paddle, canvasHeight, tracker);
        }
    }
    colision(paddle, canvasHeight, tracker) {
        this.limitspeed = 20;
        if (paddle.x < this.x) {
            if (this.x <= paddle.x + paddle.width &&
                this.y <= paddle.y + paddle.height &&
                this.y + this.height >= paddle.y) {
                paddle.interaction(this);
                tracker.recordHit();
                if (this.speed < this.limitspeed)
                    this.speed += 1;
            }
        }
        else {
            if (this.x + this.width >= paddle.x &&
                this.y <= paddle.y + paddle.height &&
                this.y + this.height >= paddle.y) {
                paddle.interaction(this);
                tracker.recordHit();
                if (this.speed < this.limitspeed)
                    this.speed += 1;
            }
        }
    }
    goal(canvasWidth) {
        if ((this.x <= 0) || (this.x >= (canvasWidth - this.width))) {
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
function randomAngleRad(minRad, maxRad) {
    if (minRad < maxRad) {
        return Math.random() * (maxRad - minRad) + minRad;
    }
    else {
        const range = 2 * Math.PI - minRad + maxRad;
        const rand = Math.random() * range;
        return (minRad + rand) % (2 * Math.PI);
    }
}
