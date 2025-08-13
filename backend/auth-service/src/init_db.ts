import Database from 'better-sqlite3'
import type { Database as Database_type} from 'better-sqlite3'

let db: Database_type;

try {
	db = new Database('./database/database.db', { verbose: console.log});
	console.log('✅ SQLite AUTH_DB connected')
} catch (err: any) {
	console.error('❌ Error: database:', err.message);
	process.exit(1);
}

try {
	db.exec(
	`CREATE TABLE IF NOT EXISTS auth (
		user_id TEXT PRIMARY KEY,
		email TEXT,
		password TEXT,
		hashed_password TEXT
		)`
	);
	console.log('✅ Auth table created or already existing');
} catch (error) {
	console.error('❌ Error SQL: ', error);
}

function createRefreshTable() {
	db.exec(
		`CREATE TABLE IF NOT EXISTS refresh_tokens (
		tokenId TEXT PRIMARY KEY,
		userId TEXT NOT NULL,
		tokenHash TEXT NOT NULL,
		revoked INTEGER NOT NULL DEFAULT 0,
		expiresAt TEXT NOT NULL,
		createdAt TEXT NOT NULL DEFAULT (datetime('now')),
		replacedBy TEXT NULL
		);
		CREATE INDEX IF NOT EXISTS idx_rt_user ON refresh_tokens(userId);
		CREATE INDEX IF NOT EXISTS idx_rt_revoked ON refrest_tokens(revoked);
		CREATE INDEX IF NOT EXISTS idx_rt_expires ON refresh_tokens(expiresAt);
	`);
}

export default db;