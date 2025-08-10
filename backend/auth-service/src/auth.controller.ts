import { FastifyRequest, FastifyReply } from "fastify";
import { createUser, deleteAuthUser, userLogin, updateEmailService, getUserById, updatePasswordService } from "./auth.service.js";
import { registerBody } from "./types/fastify.js";


export async function register(
	req: FastifyRequest<{ Body: registerBody }>,
	reply: FastifyReply) {
		const { email, password } = req.body;
		try {
			const user_id = await createUser(email, password);
			return reply.code(201).send({ user_id });
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
			const user_id = await userLogin(email, password);
			console.log('USER_ID IN LOGIN = ', user_id);
			if (!user_id)
				return reply.status(404).send({ error: 'User not found'} );
			return reply.status(200).send({ user_id, message: 'User connected'} );
		} catch (error) {
			return reply.status(400).send({ error: 'Wrong infos'} );
		}
}

export async function updateEmail(
	req: FastifyRequest,
	reply: FastifyReply) {
		const { user_id } = req.params as { user_id: string };
		const { email } = req.body as { email: string };

		try {
			const res = updateEmailService(user_id, email);
			if (!res){
				return reply.status(404).send({ error: 'User not found' });
			}
			return reply.status(200).send({ user_id, email});
		} catch (error) {
			return reply.status(500).send({ error: 'Email update failed' });
		}
}

export async function updatePassword(
	req: FastifyRequest,
	reply: FastifyReply) {
		const { user_id } = req.params as { user_id: string };
		const { oldPassword, newPassword } = req.body as { oldPassword: string, newPassword: string };
		try {
			const updated = await updatePasswordService(user_id, oldPassword, newPassword);
			if (!updated) {
				return reply.status(404).send({ error: 'User not found' });
			}
			return reply.status(204).send();
		} catch (error) {
			return reply.status(400).send({ error: 'Wrong password' });
		}
}

export async function getUser(
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