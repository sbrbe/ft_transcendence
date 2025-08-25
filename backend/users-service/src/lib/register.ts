import { FastifyRequest, FastifyReply } from "fastify";
import { db } from '../init_db.js';
import { getUserByUsername } from "./utils.js";

interface registerBody {
	userId: string;
	username: string;
	firstName: string;
	lastName: string;
}

export async function register(
	req: FastifyRequest<{ Body: registerBody }>,
	reply: FastifyReply) {
		const { userId, username, lastName, firstName } = req.body;
		try {
			const user = await createUser(userId, username, lastName, firstName);
			return reply.code(201).send({ message: 'User created successfully !' });
		} catch (error: any) {
			return reply.code(400).send({ error: error.message });
		}
}

async function createUser(userId: string, username: string, lastName: string,
	firstName: string) {

	const existingUser = getUserByUsername(username);
	console.log(existingUser);
	if (existingUser)
		throw new Error('Username already used');
	const avatarUrl = '/default.png';
	const stmt = db.prepare(`INSERT INTO users (userId, lastName, firstName, username, avatarUrl, isOnline)
		VALUES (?, ?, ?, ?, ?, ?)`);
	const info = stmt.run(userId, lastName, firstName, username, avatarUrl, 1);
	console.log(`CREATE_USERS log : ${info.lastInsertRowid}`);
	return (username);
}
