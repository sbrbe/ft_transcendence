import { FastifyRequest, FastifyReply } from "fastify";
import { getUserById } from './utils.js';


export async function getUserProfile(
	req: FastifyRequest<{ Params: { user_id: string } }>,
	reply: FastifyReply) {
		const { user_id } = req.params;

		try {
			const user = getUserById(user_id);
			if (!user) {
				return reply.status(404).send({ error: 'User not found'} );
			}
			return reply.status(200).send(user);
		} catch (error) {
			return reply.status(500).send({ error: 'Server error' })
		}
	}