import { db } from '../init_db.js';

export function getUserByEmail(email: string): { userId: string, email: string, password: string, hashedPassword: string } | undefined {
	const stmt= db.prepare('SELECT * FROM auth WHERE email = ?');
	return stmt.get(email)as { userId: string, email: string, password: string, hashedPassword: string } | undefined;
}

export function getUserById(userId: string): { userId: string, email: string, password: string, hashedPassword: string } | undefined {
	const stmt = db.prepare('SELECT * FROM auth WHERE userId = ?');
	return stmt.get(userId) as { userId: string, email: string, password: string, hashedPassword: string } | undefined;
}