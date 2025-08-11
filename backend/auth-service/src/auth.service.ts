import db from './init_db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4} from 'uuid'
import { authUser } from './types/fastify.js';

export function getUserByEmail(email: string) {
	const stmt= db.prepare('SELECT * FROM auth WHERE email = ?');
	return stmt.get(email);
}

export function getUserById(user_id: string): { email: string, password: string, hashed_password: string } | undefined {
	const stmt = db.prepare('SELECT * FROM auth WHERE user_id = ?');
	return stmt.get(user_id) as { email: string, password: string, hashed_password: string } | undefined;
}

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export async function createUser(email: string, password: string) {
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

export function deleteAuthUser(user_id: string): boolean {
	const stmt = db.prepare('DELETE FROM auth WHERE user_id = ?');
	const res = stmt.run(user_id);
	return res.changes > 0;
}

export async function userLogin(email: string, password: string) {
	const stmt = db.prepare('SELECT * FROM auth WHERE email = ?');
	const user = stmt.get(email) as authUser | undefined ;
	if (!user)
		return false;
	const passwordMatch = await bcrypt.compare(password, user.hashed_password);
	if (!passwordMatch)
		throw new Error('Wrong password');
	return (user.user_id)
}

export function updateEmailService(user_id: string, email: string) {
	const stmt = db.prepare('UPDATE auth SET email = ? WHERE user_id = ?');
	const res = stmt.run(email, user_id);
	return res.changes > 0;
}

export async function updatePasswordService(user_id: string, oldPassword: string, newPassword: string) {
	const user = getUserById(user_id);
	if (!user)
		return false;
	const match = await bcrypt.compare(oldPassword, user.hashed_password);
	console.log('oldpassword_hashed = ', user.hashed_password, 'oldpassword = ', oldPassword);
	if (!match)
		throw new Error('Old password incorrect');
	const hash_new_pass = await bcrypt.hash(newPassword, 10);
	const stmt = db.prepare('UPDATE auth SET password = ?, hashed_password = ? WHERE user_id = ?');
	const res = stmt.run(newPassword, hash_new_pass, user_id);
	return res.changes > 0;
}