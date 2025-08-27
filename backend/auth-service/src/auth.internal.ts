/*import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import db from './init_db.js';
import jwt from '@fastify/jwt';


export function makeUsersClient(app: FastifyInstance) {
	const USERS_BASE = process.env.USERS_BASE_URL || `https://users-service:${process.env.USERS_PORT || 3001}`;
	return {
		async setOnlineStatus(userId: string, online: boolean) {
			const token = app.jwt.sign(
				{ svc: 'auth-service' },
				{ expiresIn: '60s', aud: 'users-service' }
			);

			const res = await fetch(`${USERS_BASE}/internal/users/:id/online-status`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-Internal-JWT': token},
				body: JSON.stringify({
					online
				}),
			});
			if (!res.ok) {
				throw new Error(`users-service error : ${res.status}`);
			}
			return res.json();
		}
	}
}*/