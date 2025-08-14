import { FastifyRequest, FastifyReply } from "fastify";
import db from '../init_db.js';
import { getUserByUsername } from "./utils.js";

interface registerBody {
	user_id: string;
	username: string;
	first_name: string;
	last_name: string;
}

export async function register(
	req: FastifyRequest<{ Body: registerBody }>,
	reply: FastifyReply) {
		const { user_id, username, last_name, first_name } = req.body;
		try {
			const user_name = await createUser(user_id, username, last_name, first_name);
			return reply.code(201).send({ message: 'User created successfully !' });
		} catch (error) {
			if (error instanceof Error)
				return reply.code(400).send({ error: error.message });
		}
}

async function createUser(user_id: string, username: string, last_name: string,
	first_name: string) {

	const existingUser = getUserByUsername(username);
	console.log(existingUser);
	if (existingUser)
		throw new Error('Username already used');
	const avatar_url = '/default.png';
	const stmt = db.prepare(`INSERT INTO users (user_id, last_name, first_name, username, avatar_url, is_online)
		VALUES (?, ?, ?, ?, ?, ?)`);
	const info = stmt.run(user_id, last_name, first_name, username, avatar_url, 1);
	console.log(`CREATE_USERS log : ${info.lastInsertRowid}`);
	return (username);
}
