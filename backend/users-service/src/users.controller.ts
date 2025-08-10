import { FastifyRequest, FastifyReply } from "fastify";
import { createUser, disconnectUser, getUserById } from './users.service.js';
import { UserUpdate } from "./types/fastify.js";
import { updateUser } from "./users.service.js";

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
	req: FastifyRequest<{ Body: { user_id: string } }>,
	reply: FastifyReply) {
		const { user_id } = req.body;

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

export async function updateProfile(
	req: FastifyRequest<{ Body: UserUpdate }>,
	reply: FastifyReply) {
		const { user_id } = req.params as { user_id: string };
		const { last_name, first_name, username, display_name, avatar_url } = req.body;

		if (!last_name && !first_name && !username && !display_name && !avatar_url) {
			return reply.status(400).send({ error: 'No fields to update' });
		}
		try {
			const res = updateUser(user_id, { last_name, first_name, username, display_name, avatar_url });
			if (!res) {
				return reply.status(404).send( { error: 'User not found' });
			}
			return reply.status(200).send(res);
		} catch (error) {
			return reply.status(500).send({ error: 'Profile update failed' });
		}
}

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