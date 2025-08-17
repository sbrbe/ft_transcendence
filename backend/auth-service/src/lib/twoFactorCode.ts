import { db } from '../init_db.js';
import crypto, { createHmac, randomBytes, randomInt } from 'node:crypto';

export interface TwoFactorCode {
	id: number;
	userId: string;
	code: string;
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
	userId: string,
	ipAddress?: string,
	userAgent?: string) {
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
	code: string,
	ipAddress?: string,
	userAgent?: string) {
		if (!/^\d{6}$/.test(code)) {
			return { success: false, error: "invalid format" };
		}

		const stmt = db.prepare(
			`SELECT * FROM two_factor_codes
			 WHERE userId = ? AND used IS NULL
			 ORDER BY id DESC LIMIT 1`)
		const twoFactorCode = stmt.get(userId) as TwoFactorCode | undefined;
		if (!twoFactorCode) {
			return { success: false, error: "no code for this user" };
		}

		const exp = new Date(twoFactorCode.expiresAt + "Z").getTime();
		if (Date.now() > exp) {
			return { success: false, error: "code expired" };
		}

		if (twoFactorCode.attempts >= maxAttempts) {
			return { success: false, error: "too many attempts" };
		}

		const matchCode = hashCode(code, twoFactorCode.nonce as Buffer);
		db.prepare(`UPDATE two_factor_codes SET attempts = + 1 WHERE id = ?`)
		.run( twoFactorCode.id);
		if (!matchCode) {
			return { success: false, error: "invalid code" };
		}
		db.prepare(`UPDATE two_factor_codes SET uset = TRUE WHERE id = ?`)
		.run(twoFactorCode.id);
		return { success: true, message: "valid code" };
}


function deleteCode(userId: string) {
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