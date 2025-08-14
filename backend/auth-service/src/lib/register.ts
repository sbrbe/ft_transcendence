import { FastifyReply, FastifyRequest } from 'fastify';
import { getUserByEmail } from './utils.js';
import { registerBody } from "../types/fastify.js";
import db from '../init_db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4} from 'uuid';

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

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

async function createUser(email: string, password: string) {
	const existingUser = getUserByEmail(email);
	if (existingUser)
		throw new Error ('Email already used');
	if (!strongPasswordRegex.test(password))
		throw new Error ('Password too weak');

	const user_id = uuidv4();
	const hash_password = await bcrypt.hash(password, 10);
	const stmt = db.prepare('INSERT INTO auth (user_id, email, password, hashed_password) VALUES (?, ?, ?, ?)');
	const info = stmt.run(user_id, email, password, hash_password);
	console.log(`CREATE_AUTH log : ${info.lastInsertRowid}`);
	return (user_id);
}