 import db from './init_db.js';
 import bcrypt from 'bcrypt';
 import { v4 as uuidv4} from 'uuid'
 import { authUser } from './types/fastify.js';

 export async function insertRefrestToken( id: string, userId: string, tokenPlain: string, expiresAt: Date) {
	createRefreshTable();
	const tokenHash = await bcrypt.hash(tokenPlain, 10);
	const stmt = db.prepare(`INSERT INTO refresh_tokens(id, userId, tokenHash, expiresAt)
		VALUES (?, ?, ?, ?)`);
		stmt.run(id, userId, tokenHash, expiresAt.toISOString());
 }

export function getRefreshTokenById(id: string) {
	createRefreshTable();
	const stmt = db.prepare(`SELECT * FROM refresh_tokens WHERE tokenId= ?`);
	return stmt.get(id) as | { tokenId: string; userId: string; tokenHash: string; revoked: number; expiresAt: string; replacedBy?: string } | undefined;
}

export function revokeRefreshToken(id: string) {
	createRefreshTable();
	const stmt = db.prepare(`UPDATE refresh_tokens SET revoked = 1 WHERE tokenId = ?`);
	stmt.run(id);
}

export function setReplacedBy(id: string, newId: string) {
	createRefreshTable();
	const stmt = db.prepare(`UPDATE refresh_tokens SET replacedBy = ? WHERE tokenId = ?`);
	stmt.run(newId, id);
}