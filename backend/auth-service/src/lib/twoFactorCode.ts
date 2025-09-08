import { db } from '../init_db.js';
import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

export interface TwoFactorCode {
	id: number;
	userId: string;
	code: string;
	hashedCode: Buffer,
	nonce: Buffer,
	expiresAt: string;
	used: boolean;
	attempts: number;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: string;
}

if (!process.env.TWO_FA_SECRET)
	throw new Error("TWO_FA_SECRET is not set");

const TWO_FA_SECRET = process.env.TWO_FA_SECRET;
const timeLimitMinutes = 5;
const maxAttempts = 5;

export async function createTwoFactorCode(
	userId: string) {
		deleteCode(userId);
		const code = generateCode();
		const nonce = randomBytes(16);
		const hashedCode = hashCode(code, nonce);
		const stmt = db.prepare(
			`INSERT INTO two_factor_codes (userId, code, hashedCode, nonce, expiresAt)
			VALUES (?, ?, ?, ?, datetime('now', '+${timeLimitMinutes} minutes'))`
		);
		stmt.run(userId, code, hashedCode, nonce);
		return code;
}

export function verifyTwoFactorCode(
	userId: string,
	code: string) {
		if (!/^\d{6}$/.test(code)) {
			return { success: false, error: "invalid format" };
		}

		const stmt = db.prepare(
			`SELECT * FROM two_factor_codes
			 WHERE userId = ? AND used = 0
			 ORDER BY id DESC LIMIT 1`)
		const twoFactorCode = stmt.get(userId) as TwoFactorCode | undefined;
		console.log('2FA row = ', twoFactorCode);
		if (!twoFactorCode) {
			throw new Error('No code for this user');
		}

		const exp = new Date(twoFactorCode.expiresAt + "Z").getTime();
		if (Date.now() > exp) {
			throw new Error('Code expired');
		}

		if (twoFactorCode.attempts >= maxAttempts) {
			throw new Error('Too many attempts');
		}

		const matchCode = hashCode(code, twoFactorCode.nonce as Buffer);
		db.prepare(`UPDATE two_factor_codes SET attempts = attempts + 1 WHERE id = ?`)
		.run( twoFactorCode.id);
		if (!safeEqual(matchCode, twoFactorCode.hashedCode)) {
			throw new Error('Invalid code');
		}
		db.prepare(`UPDATE two_factor_codes SET used = TRUE WHERE id = ?`)
		.run(twoFactorCode.id);
}

export function deleteCode(userId: string) {
	const stmt = db.prepare(`DELETE FROM two_factor_codes WHERE userId = ? AND used = FALSE`);
	return stmt.run(userId);
}

function generateCode(): string {
	const n = randomInt(0, 1_000_000);
	return n.toString().padStart(6, "0");
}

function hashCode(code: string, nonce: Buffer): Buffer {
	return createHmac("sha256", TWO_FA_SECRET).update(Buffer.concat([nonce, Buffer.from(code, "utf8")]))
		.digest();
}

function safeEqual(a: Buffer, b: Buffer): boolean {
	if (a.length !== b.length)
		return false;
	return timingSafeEqual(a,b);
}