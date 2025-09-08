import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '../init_db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4} from 'uuid';


export function cookieOptions(path: string) {
	return {
		path,
		httpOnly: true,
		sameSite: 'none' as const,
		secure: true,
	}
}

export async function signAccessToken(reply: FastifyReply, userId: string) {
	const token = await reply.accessJwtSign({ sub: userId });
	return token;
}

export async function signRefreshToken(reply: FastifyReply, userId: string) {
	const jti = uuidv4();
	const token = await reply.refreshJwtSign({ sub: userId, jti });
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	await insertRefreshToken(jti, userId, token, expiresAt)

	return { token, jti };
}

export async function setAuthCookies(reply: FastifyReply, userId: string) {
	const [access, refresh] = await Promise.all([
		signAccessToken(reply, userId),
		signRefreshToken(reply, userId),
	]);
	reply.setCookie('accessToken', access, {
		...cookieOptions('/'),
		maxAge: Number(15) * 60,
	});
	reply.setCookie('refreshToken', refresh.token, {
		...cookieOptions('/auth'),
		maxAge: Number(7) * 24 * 60 * 60,
	});
	return { accessToken: access, refreshToken: refresh };
}

export function clearAuthCookies(reply: FastifyReply) {
	reply.clearCookie('accessToken', cookieOptions('/'));
	reply.clearCookie('refreshToken', cookieOptions('/auth'));
}

export async function rotateRefresh(req: FastifyRequest, reply:FastifyReply) {
	const { refreshToken } = req.cookies as Record<string, string | undefined>;
	if (!refreshToken) {
		return reply.status(401).send('Missing refreshToken cookie')
	}

	const payload = await req.refreshJwtVerify<{ sub: string; jti: string }> ({ onlyCookie: true });
	const record = getRefreshToken(payload.jti);
	if (!record || record.revoked || record.expiresAt.getTime() < Date.now()) {
		return reply.status(401).send('Invalid or expired refresh token')
	}

	revokeRefreshToken(payload.jti);
	const newToken = await setAuthCookies(reply, payload.sub);
	return reply.status(200).send({ accessToken: newToken.accessToken, message: 'New token generated' });
}


export async function insertRefreshToken(
	jti: string,
	userId: string,
	token: string,
	expiresAt: Date,
) {
	const hashedToken = await bcrypt.hash(token, 10);
	const stmt = db.prepare(`INSERT INTO refresh_tokens (jti, userId, hashedToken, expiresAt)
		VALUES (?, ?, ?, ?)`);
	const res = stmt.run(jti, userId, hashedToken, expiresAt.toISOString());
}

export function getRefreshToken(jti: string) {
	const stmt = db.prepare(`SELECT * FROM refresh_tokens WHERE jti = ?`);
	const row = stmt.get(jti) as | {
		jti: string;
		userId: string;
		hashedToken: string;
		revoked: string;
		expiresAt: string;
		replacedby?: string;
	} | undefined;

	if (!row)
		return undefined;

	return { ...row, expiresAt: new Date(row.expiresAt)};
}

export function revokeRefreshToken(jti: string) {
	db.prepare(`UPDATE refresh_tokens SET revoked = 1 WHERE jti = ?`).run(jti);
}

export function revokeAllForUser(userId: string) {
	db.prepare(`UPDATE refresh_tokens SET revoked = 1 WHERE userId = ?`).run(userId);
}

export function setReplaceBy(jti: string, newId: string) {
	db.prepare(`UPDATE refresh_tokens SET replacedBy = ? WHERE jti = ?`).run(jti, newId);
}

export function deleteRefreshToken(userId: string) {
	db.prepare(`DELETE FROM refresh_tokens WHERE userId = ?`).run(userId);
}