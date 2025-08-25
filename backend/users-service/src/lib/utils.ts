import { db } from '../init_db.js';
import { UserUpdate } from '../types/fastify.js';

export function getUserByUsername(username: string) {
	const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
	return stmt.get(username);
}

export function getUserById(userId: string) {
	const stmt = db.prepare('SELECT * FROM users WHERE userId = ?');
	return stmt.get(userId);
}