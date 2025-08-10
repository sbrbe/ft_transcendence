import db from './init_db.js';
import { UserUpdate } from './types/fastify.js';

export function getUserByUsername(username: string) {
	const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
	return stmt.get(username);
}

export function getUserById(user_id: string) {
	const stmt = db.prepare('SELECT * FROM users WHERE user_id = ?');
	return stmt.get(user_id);
}

export async function createUser(user_id: string, username: string, last_name: string,
	first_name: string, display_name: string) {

	const existingUser = getUserByUsername(username);
	console.log(existingUser);
	if (existingUser)
		throw new Error('Username already used');
	const avatar_url = '/default.png';
	const stmt = db.prepare(`INSERT INTO users (user_id, last_name, first_name, username, display_name, avatar_url, is_online)
		VALUES (?, ?, ?, ?, ?, ?, ?)`);
	const info = stmt.run(user_id, last_name, first_name, username, display_name, avatar_url, 1);
	console.log(`CREATE_USERS log : ${info.lastInsertRowid}`);
	return (username);
}

export function disconnectUser(user_id: string): boolean
{
	const existingUser = getUserById(user_id);
	if (!existingUser)
		return false;

	const stmt = db.prepare('UPDATE users SET is_online = 0 WHERE user_id = ?');
	const info = stmt.run(user_id);
	console.log(`LOGOUT : ${info.changes}`);
	return true;
}

export function updateUser(user_id: string, data: UserUpdate) {
	const stmt = db.prepare (`UPDATE users SET
		last_name = COALESCE(?, last_name),
		first_name = COALESCE(?, first_name),
		username = COALESCE(?, username),
		display_name = COALESCE(?, display_name),
		avatar_url = COALESCE(?, avatar_url)
		WHERE user_id = ?`);
	const res = stmt.run(data.last_name, data.first_name, data.username, data.display_name, data.avatar_url, user_id);
	if (res.changes < 0) {
		return false;
	}
	const user = getUserById(user_id);
	return user;
}