export class Paddle {
    constructor(x, y, width, height, color, speed = 9) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = speed;
    }
    moove(dir) {
        this.y += dir * this.speed;
    }
    interaction(ball) {
        const bHitY = ball.y + ball.height / 2;
        const pddCenter = this.y + this.height / 2;
        let normalizeContact = (bHitY - pddCenter) / (this.height / 2);
        normalizeContact = Math.max(-1, Math.min(1, normalizeContact));
        const angle = normalizeContact * (Math.PI / 3);
        let vect = ball.vx < 0 ? 1 : -1;
        ball.vx = (Math.cos(angle) * ball.speed) * vect;
        ball.vy = Math.sin(angle) * ball.speed;
    }
}
