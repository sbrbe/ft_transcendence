import { FastifyRequest, FastifyReply } from "fastify";
import db from '../init_db.js';
import { getUserById } from "./utils.js";

export async function logout(
	req: FastifyRequest<{ Body: { user_id: string } }>,
	reply: FastifyReply) {
		const { user_id } = req.body;

		try {
			const user = await disconnectUser(user_id);
			if (!user)
				return reply.status(404).send({ error: 'User not found' });
			return reply.status(200).send({ user_id, message: 'User disconnected' });
		} catch (error) {
			if (error instanceof Error)
				return reply.status(500).send({ error: error.message });
		}
}

async function disconnectUser(user_id: string): Promise<boolean>
{
	const existingUser = getUserById(user_id);
	if (!existingUser)
		return false;

	const stmt = db.prepare('UPDATE users SET is_online = 0 WHERE user_id = ?');
	const info = stmt.run(user_id);
	console.log(`LOGOUT : ${info.changes}`);
	return true;
}