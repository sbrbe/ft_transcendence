import { FastifyReply, FastifyRequest } from 'fastify';
import db from '../init_db.js';

export async function updateEmail(
	req: FastifyRequest,
	reply: FastifyReply) {
		const { user_id } = req.params as { user_id: string };
		const { email } = req.body as { email: string };

		try {
			const res = updateEmailService(user_id, email);
			if (!res){
				return reply.status(404).send({ error: 'User not found' });
			}
			return reply.status(200).send({ user_id, email});
		} catch (error) {
			return reply.status(500).send({ error: 'Email update failed' });
		}
}

function updateEmailService(user_id: string, email: string) {
	const stmt = db.prepare('UPDATE auth SET email = ? WHERE user_id = ?');
	const res = stmt.run(email, user_id);
	return res.changes > 0;
}