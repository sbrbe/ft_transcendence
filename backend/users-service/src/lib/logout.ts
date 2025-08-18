import { FastifyRequest, FastifyReply } from "fastify";
import db from '../init_db.js';
import { getUserById } from "./utils.js";

export async function logout(
	req: FastifyRequest<{ Body: { userId: string } }>,
	reply: FastifyReply) {
		const { userId } = req.body;

		try {
			const user = await disconnectUser(userId);
			if (!user)
				return reply.status(404).send({ error: 'User not found' });
			return reply.status(200).send({ userId, message: 'User disconnected' });
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}

async function disconnectUser(userId: string): Promise<boolean>
{
	const existingUser = getUserById(userId);
	if (!existingUser)
		return false;

	const stmt = db.prepare('UPDATE users SET isOnline = 0 WHERE userId = ?');
	const info = stmt.run(userId);
	console.log(`LOGOUT : ${info.changes}`);
	return true;
}