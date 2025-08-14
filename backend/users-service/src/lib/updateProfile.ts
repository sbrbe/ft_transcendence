import { FastifyRequest, FastifyReply } from "fastify";
import db from '../init_db.js';
import { getUserById } from "./utils.js";
import { UserUpdate } from "../types/fastify.js";

export async function updateProfile(
	req: FastifyRequest<{ Body: UserUpdate }>,
	reply: FastifyReply) {
		const { user_id } = req.params as { user_id: string };
		const { last_name, first_name, username, avatar_url } = req.body;

		if (!last_name && !first_name && !username && !avatar_url) {
			return reply.status(400).send({ error: 'No fields to update' });
		}
		try {
			const res = await updateUser(user_id, { last_name, first_name, username, avatar_url });
			if (!res) {
				return reply.status(404).send( { error: 'User not found' });
			}
			return reply.status(200).send(res);
		} catch (error) {
			return reply.status(500).send({ error: 'Profile update failed' });
		}
}

async function updateUser(user_id: string, data: UserUpdate) {
	const stmt = db.prepare (`UPDATE users SET
		last_name = COALESCE(?, last_name),
		first_name = COALESCE(?, first_name),
		username = COALESCE(?, username),
		avatar_url = COALESCE(?, avatar_url)
		WHERE user_id = ?`);
	const res = stmt.run(data.last_name, data.first_name, data.username, data.avatar_url, user_id);
	if (res.changes < 0) {
		return false;
	}
	const user = getUserById(user_id);
	return user;
}