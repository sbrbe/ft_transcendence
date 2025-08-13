import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import db from './init_db.js';
import jwt from '@fastify/jwt';

async function verifyInternal(req: FastifyRequest,reply: FastifyReply) {
	const token = req.headers['x-internal-jwt'];
	if (!token || typeof token !== 'string') {
		return reply.status(401).send({ error: 'Missing internal token' });
	}
	try {
		const payload = await req.jwtVerify<{ svc: String; aud?: String; purpose?: string }>({ token });
		if (payload.svc !== 'auth-service' || payload.aud !== 'users-service' || payload.purpose !== 'mutate-online') {
			return reply.status(403).send({ error: 'Forbidden internal caller' });
		}
	} catch (error) {
		return reply.status(401).send({ error: 'Invalid internal token' });
	}
}

export default async function(app: FastifyInstance) {
	app.post('internal/users/:id/online-status', { preHandler: verifyInternal },
		async (req: FastifyRequest, reply: FastifyReply) => {
			const { user_id } = req.params as { user_id: string };
			const { online } = req.body as { online: boolean };

			const stmt = db.prepare(`UPDATE users SET online_status = ? WHERE user_id = ?`);
			const res = stmt.run(online ? 1: 0, user_id);

			return { success: true, user_id, online };
		});
}