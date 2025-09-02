import { db } from '../init_db.js';
import { User, Friend } from '../types/fastify.js';

export function getUserByUsername(username: string) {
	const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
	return stmt.get(username) as User | undefined ;
}

export function getUserById(userId: string) {
	const stmt = db.prepare('SELECT * FROM users WHERE userId = ?');
	return stmt.get(userId) as User | undefined ;
}

export function getFriendship(userId: string, friendId: string) {
	const stmt = db.prepare(`SELECT * FROM friendships WHERE (userId = ? AND friendId = ?)
		OR (userId = ? AND friendId = ?)`);
	return stmt.get(userId, friendId, friendId, userId) as Friend | undefined;
}