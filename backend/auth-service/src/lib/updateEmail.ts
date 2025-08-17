import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '../init_db.js';

export async function updateEmail(
	req: FastifyRequest,
	reply: FastifyReply) {
		const { userId } = req.params as { userId: string };
		const { email } = req.body as { email: string };

		try {
			const res = updateEmailService(userId, email);
			if (!res){
				return reply.status(404).send({ error: 'User not found' });
			}
			return reply.status(200).send({ userId, email});
		} catch (error) {
			return reply.status(500).send({ error: 'Email update failed' });
		}
}

function updateEmailService(userId: string, email: string) {
	const stmt = db.prepare('UPDATE auth SET email = ? WHERE userId = ?');
	const res = stmt.run(email, userId);
	return res.changes > 0;
}