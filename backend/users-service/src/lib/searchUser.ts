import { FastifyRequest, FastifyReply } from "fastify";
import { getUserByUsername } from './utils.js';

export default async function searchUser(
	req: FastifyRequest<{ Body: { username: string } }>,
	reply: FastifyReply) {
		const { username } = req.body;

		try {
			const user = getUserByUsername(username);
			if (!user) {
				return reply.status(404).send({ error: 'User not found' });
			}
			return reply.status(200).send({
				userId: user.userId,
				username: user.username,
				avatarUrl: user.avatarUrl
			});
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}