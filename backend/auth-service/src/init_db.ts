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

export default db;