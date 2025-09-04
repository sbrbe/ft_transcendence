import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';


export default fp(async function jwtSetup(app: FastifyInstance) {
	await app.register(fastifyCors, {
		origin: true,
		credentials: true,
	})
	
	await app.register(fastifyCookie, {
		secret: process.env.COOKIE_SECRET!,
	});

	await app.register(fastifyJwt, {
		decoratorName: 'accessJwt',
		namespace: 'access',
		secret: process.env.JWT_ACCESS_SECRET!,
		cookie: { cookieName: 'accessToken', signed: false }
	});

	app.decorate("authenticate", async function(req: FastifyRequest, reply: FastifyReply) {
		try {
			await req.accessJwtVerify();
		} catch {
			return reply.status(401).send({ message: 'Unauthorized' });
		}
	});
});