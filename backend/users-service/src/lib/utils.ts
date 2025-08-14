import db from '../init_db.js';
import { UserUpdate } from '../types/fastify.js';

export function getUserByUsername(username: string) {
	const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
	return stmt.get(username);
}

export function getUserById(user_id: string) {
	const stmt = db.prepare('SELECT * FROM users WHERE user_id = ?');
	return stmt.get(user_id);
}