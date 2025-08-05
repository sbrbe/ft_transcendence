import { FastifyRequest, FastifyReply } from "fastify";
import { createUser, deleteAuthUser, userLogin } from "./auth.service.js";
import { registerBody } from "./types/fastify.js";


export async function register(
	req: FastifyRequest<{ Body: registerBody }>,
	reply: FastifyReply) {
		const { email, password } = req.body;
		try {
			const userId = await createUser(email, password);
			return reply.code(201).send({ userId });
		} catch (error) {
			return reply.code(400).send({ error: 'Email already used'});
		}
}

export async function deleteUser( 
	req: FastifyRequest<{ Params: { user_id: string } }>,
	reply: FastifyReply) {
		const { user_id } = req.params;

		try {
			const deleted = deleteAuthUser(user_id);
			if (!deleted)
				return reply.status(404).send({ error: 'User not found'});
			return reply.status(204).send();
		} catch (error) {
			return reply.status(500).send({ error: 'Error while deleting' });
		}
}

export async function login(
	req: FastifyRequest<{ Body: registerBody }>,
	reply: FastifyReply) {
		const { email, password } = req.body;
		try{
			const userId = await userLogin(email, password);
			if (!userId)
				return reply.status(404).send({ error: 'User not found'} );
			return reply.status(200).send({ userId, message: 'User connected'} );
		} catch (error) {
			return reply.status(400).send({ error: 'Wrong infos'} );
		}
}