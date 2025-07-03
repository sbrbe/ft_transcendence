"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fastify = (0, fastify_1.default)({ logger: true });
fastify.post('/next-move', async (request, reply) => {
    const { ball, paddle, speed, tableHeight, tableWidth, paddleHeight, iaX } = request.body;
    const SPEED = speed;
    const TABLE_HEIGHT = tableHeight;
    const IA_X = iaX;
    let targetY = TABLE_HEIGHT / 2;
    if (ball.dx > 0) {
        let timeToImpact = (IA_X - ball.x) / ball.dx;
        let predictedY = ball.y + ball.dy * timeToImpact;
        while (predictedY < 0 || predictedY > TABLE_HEIGHT) {
            if (predictedY < 0)
                predictedY = -predictedY;
            if (predictedY > TABLE_HEIGHT)
                predictedY = 2 * TABLE_HEIGHT - predictedY;
        }
        const fudge = 0.3 * TABLE_HEIGHT;
        predictedY += (Math.random() - 0.5) * fudge;
        targetY = predictedY;
    }
    return { targetY };
});
fastify.listen({ port: 3003, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`🤖 IA server listening at ${address}`);
});
