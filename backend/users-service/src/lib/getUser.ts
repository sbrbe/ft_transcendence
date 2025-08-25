import { FastifyRequest, FastifyReply } from "fastify";
import { getUserById } from './utils.js';

export async function getUserProfile(
	req: FastifyRequest<{ Params: { userId: string } }>,
	reply: FastifyReply) {
		const { userId } = req.params;

		try {
			const user = getUserById(userId);
			if (!user) {
				return reply.status(404).send({ error: 'User not found'} );
			}
			return reply.status(200).send(user);
		} catch (error: any) {
			return reply.status(500).send({ error: error.message })
		}
	}