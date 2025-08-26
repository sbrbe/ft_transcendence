export class Player {
    constructor(paddle, keys, name, id = 0) {
        this.paddle = paddle;
        this.keys = keys;
        this.input = { [keys.up]: false, [keys.down]: false };
        this.id = id;
        this.name = name;
    }
    update(ball, canvasHeight) {
        if (this.input[this.keys.up] && this.paddle.y > 0) {
            this.paddle.moove(-1);
        }
        else if (this.input[this.keys.down] && (this.paddle.y + this.paddle.height < canvasHeight)) {
            this.paddle.moove(1);
        }
    }
}
