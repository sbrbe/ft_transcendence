import db from '../init_db.js';

export function getUserByEmail(email: string) {
	const stmt= db.prepare('SELECT * FROM auth WHERE email = ?');
	return stmt.get(email);
}

export function getUserById(user_id: string): { email: string, password: string, hashed_password: string } | undefined {
	const stmt = db.prepare('SELECT * FROM auth WHERE user_id = ?');
	return stmt.get(user_id) as { email: string, password: string, hashed_password: string } | undefined;
}