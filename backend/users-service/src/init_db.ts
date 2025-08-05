import Database from 'better-sqlite3'
import type { Database as Database_type} from 'better-sqlite3'

let db: Database_type;

try {
	db = new Database('./database/database.db', { verbose: console.log});
	console.log('✅ SQLite USER_DB connected')
} catch (err: any) {
	console.error('❌ Error: database:', err.message);
	process.exit(1);
}

try {
	db.exec(
	`CREATE TABLE IF NOT EXISTS users (
		user_id TEXT PRIMARY KEY,
		first_name TEXT,
		last_name TEXT,
		username TEXT,
		display_name TEXT,
		is_online BOOLEAN DEFAULT FALSE
		)`
	);
	console.log('✅ Users table created or already existing');
} catch (error) {
	console.error('❌ Error SQL: ', error);
}

try {
	db.exec(
	`CREATE TABLE IF NOT EXISTS friendships (
		user_id TEXT PRIMARY KEY,
		requester_id TEXT NOT NULL,
		addressee_id TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'pending'
		)`
	);
	console.log('✅ Users table created or already existing');
} catch (error) {
	console.error('❌ Error SQL: ', error);
}

export default db;