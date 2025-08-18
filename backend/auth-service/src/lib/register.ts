import { FastifyReply, FastifyRequest } from 'fastify';
import { getUserByEmail } from './utils.js';
import { registerBody } from "../types/fastify.js";
import { db } from '../init_db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4} from 'uuid';

export async function register(
	req: FastifyRequest<{ Body: registerBody }>,
	reply: FastifyReply) {
		const { email, password } = req.body;
		try {
			const userId = await createUser(email, password);
			return reply.code(201).send({ userId });
		} catch (error: any) {
			return reply.code(400).send({ error: error.message});
		}
}

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

async function createUser(email: string, password: string) {
	const existingUser = getUserByEmail(email);
	console.log('registerUser : ', existingUser);
	if (existingUser)
		throw new Error ('Email already used');
	if (!strongPasswordRegex.test(password))
		throw new Error ('Password too weak');

	const userId = uuidv4();
	const hashedPassword = await bcrypt.hash(password, 10);
	const stmt = db.prepare('INSERT INTO auth (userId, email, password, hashedPassword) VALUES (?, ?, ?, ?)');
	const info = stmt.run(userId, email, password, hashedPassword);
	console.log(`CREATE_AUTH log : ${info.lastInsertRowid}`);
	return (userId);
}