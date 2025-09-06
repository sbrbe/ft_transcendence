import { FastifyReply, FastifyRequest } from 'fastify';
import { getUserById } from './utils.js';


export async function getEmail(
	req: FastifyRequest<{ Params: { userId: string } }>,
	reply: FastifyReply) {
		const { userId } = req.params;
		console.log('USER_ID IN GET_USER = ', userId);
		try {
			const user = getUserById(userId);
			if (!user) {
				return reply.status(404).send({ error: 'User not found' });
			}
			return reply.status(200).send({ userId: userId, email: user.email });
		} catch (error: any) {
			return reply.status(500).send({ error: 'Server error' });
		}
}