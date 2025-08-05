import { FastifyRequest, FastifyReply } from "fastify";
import { createUser, disconnectUser } from './users.service.js';

interface registerBody {
	user_id: string;
	username: string;
	first_name: string;
	last_name: string;
	display_name: string;
}

export async function register(
	req: FastifyRequest<{ Body: registerBody }>,
	reply: FastifyReply) {
		const { user_id, username, last_name, first_name, display_name } = req.body;
		try {
			const user_name = await createUser(user_id, username, last_name, first_name, display_name);
			return reply.code(201).send({ message: 'User created successfully !' });
		} catch (error) {
			if (error instanceof Error)
				return reply.code(400).send({ error: error.message });
		}
}

export async function logout(
	req: FastifyRequest<{Params: { user_id: string } }>,
	reply: FastifyReply) {
		const { user_id } = req.params;

		try {
			const user = disconnectUser(user_id);
			if (!user)
				return reply.status(404).send({ error: 'User not found' });
			return reply.status(200).send({ user_id, message: 'User disconnected' });
		} catch (error) {
			if (error instanceof Error)
				return reply.status(500).send({ error: error.message });
		}
}

export async function updateUser(
	
)