import { FastifyRequest, FastifyReply } from "fastify";
import { getUserByUsername } from './utils.js';

export default async function searchUser(
	req: FastifyRequest<{ Params: { username: string } }>,
	reply: FastifyReply) {
		const { username } = req.params;

		try {
			const user = getUserByUsername(username);
			if (!user) {
				return reply.status(404).send({ error: 'User not found' });
			}
			return reply.status(200).send({
				userId: user.userId,
				avatarPath: user.avatarPath
			});
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}