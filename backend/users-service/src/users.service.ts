import db from './init_db.js';

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
	const stmt = db.prepare(`INSERT INTO users (user_id, last_name, first_name, username, display_name)
		VALUES (?, ?, ?, ?, ?)`);
	const info = stmt.run(user_id, last_name, first_name, username, display_name);
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