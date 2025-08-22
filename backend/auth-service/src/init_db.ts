import Database from 'better-sqlite3'
import type { Database as Database_type} from 'better-sqlite3'

export let db: Database_type;

export function initDB() {
	try {
		db = new Database('./database/database.db', { verbose: console.log});
		console.log('Initializing database ...');

		db.exec(createAuthTable);
		db.exec(create2FATable);
		db.exec(createRefreshTable);

		console.log('✅ SQLite AUTH_DB connected');
	} catch (err: any) {
		console.error('❌ Error: database:', err.message);
		process.exit(1);
	}
}



const createAuthTable = 
	`CREATE TABLE IF NOT EXISTS auth (
		userId TEXT PRIMARY KEY,
		email TEXT,
		password TEXT,
		hashedPassword TEXT
		)`;

const create2FATable = 
	`CREATE TABLE IF NOT EXISTS two_factor_codes (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		userId TEXT NOT NULL,
		code TEXT NOT NULL,
		hashedCode BLOB NOT NULL,
		nonce BLOB NOT NULL,
		expiresAt DATETIME NOT NULL,
		used INTEGER NOT NULL DEFAULT 0,
		attempts INTEGER NOT NULL DEFAULT 0,
		ipAddress TEXT,
		userAgent TEXT,
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (userId) REFERENCES auth (userId) ON DELETE CASCADE
		)`;

const createRefreshTable =
	`CREATE TABLE IF NOT EXISTS refresh_tokens (
		jti TEXT PRIMARY KEY,
		userId TEXT NOT NULL,
		hashedToken TEXT NOT NULL,
		revoked INTEGER NOT NULL DEFAULT 0,
		expiresAt TEXT NOT NULL,
		createdAt TEXT NOT NULL DEFAULT (datetime('now'))
		);
		CREATE INDEX IF NOT EXISTS idx_rt_user ON refresh_tokens(userId);
		CREATE INDEX IF NOT EXISTS idx_rt_revoked ON refresh_tokens(revoked);
		CREATE INDEX IF NOT EXISTS idx_rt_expires ON refresh_tokens(expiresAt);
		`;