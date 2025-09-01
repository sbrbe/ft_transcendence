import { FastifyRequest, FastifyReply } from "fastify";
import { db } from '../init_db.js';
import { getUserById } from "./utils.js";
import { UserUpdate } from "../types/fastify.js";

export async function updateProfile(
	req: FastifyRequest<{ Body: UserUpdate }>,
	reply: FastifyReply) {
		const { userId } = req.params as { userId: string };
		const { lastName, firstName, username, avatarPath } = req.body;

		if (!lastName && !firstName && !username && !avatarPath) {
			return reply.status(400).send({ error: 'No fields to update' });
		}
		try {
			const res = await updateUser(userId, { lastName, firstName, username, avatarPath });
			if (!res) {
				return reply.status(404).send( { error: 'User not found' });
			}
			return reply.status(200).send(res);
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}

async function updateUser(userId: string, data: UserUpdate) {
	const stmt = db.prepare (`UPDATE users SET
		lastName = COALESCE(?, lastName),
		firstName = COALESCE(?, firstName),
		username = COALESCE(?, username),
		avatarPath = COALESCE(?, avatarPath)
		WHERE userId = ?`);
	const res = stmt.run(data.lastName, data.firstName, data.username, data.avatarPath, userId);
	if (res.changes < 0) {
		return false;
	}
	const user = getUserById(userId);
	return user;
}