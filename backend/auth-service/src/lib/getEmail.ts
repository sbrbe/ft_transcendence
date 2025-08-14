import { FastifyReply, FastifyRequest } from 'fastify';
import { getUserById } from './utils.js';


export async function getEmail(
	req: FastifyRequest<{ Params: { user_id: string } }>,
	reply: FastifyReply) {
		const { user_id } = req.params;
		console.log('USER_ID IN GET_USER = ', user_id);
		try {
			const user = getUserById(user_id);
			if (!user) {
				return reply.status(404).send({ error: 'User not found' });
			}
			return reply.status(200).send({ email: user.email, user_id: user_id });
		} catch (error) {
			return reply.status(500).send({ error: 'Server error' });
		}
}