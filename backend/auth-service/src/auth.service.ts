import db from './init_db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4} from 'uuid'
import { authUser } from './types/fastify.js';

export function getUserByEmail(email: string) {
	const stmt= db.prepare('SELECT * FROM auth WHERE email = ?');
	return stmt.get(email);
}

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export async function createUser(email: string, password: string) {
	const existingUser = getUserByEmail(email);
	if (existingUser)
		throw new Error ('Email already used');
	if (!strongPasswordRegex.test(password))
		throw new Error ('Password too weak');

	const userId = uuidv4();
	const hash_password = await bcrypt.hash(password, 10);
	const stmt = db.prepare('INSERT INTO auth (user_id, email, password) VALUES (?, ?, ?)');
	const info = stmt.run(userId, email, hash_password);
	console.log(`CREATE_AUTH log : ${info.lastInsertRowid}`);
	return (userId);
}

export function deleteAuthUser(userId: string): boolean {
	const stmt = db.prepare('DELETE FROM auth WHERE user_id = ?');
	const res = stmt.run(userId);

	return res.changes > 0;
}

export async function userLogin(email: string, password: string) {
	const stmt = db.prepare('SELECT * FROM auth WHERE email = ?');
	const user = stmt.get(email) as authUser | undefined ;

	if (!user)
		return false;

	const passwordMatch = await bcrypt.compare(password, user.password);

	if (!passwordMatch)
		throw new Error('Wrong password');

	return (user.user_id)
}