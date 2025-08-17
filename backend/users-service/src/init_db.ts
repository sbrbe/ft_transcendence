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
		userId TEXT PRIMARY KEY,
		firstName TEXT,
		lastName TEXT,
		username TEXT,
		avatarUrl TEXT,
		isOnline BOOLEAN DEFAULT FALSE
		)`
	);
	console.log('✅ Users table created or already existing');
} catch (error) {
	console.error('❌ Error SQL: ', error);
}

try {
	db.exec(
	`CREATE TABLE IF NOT EXISTS friendships (
		userId TEXT PRIMARY KEY,
		requesterId TEXT NOT NULL,
		addresseeId TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'pending'
		)`
	);
	console.log('✅ Users table created or already existing');
} catch (error) {
	console.error('❌ Error SQL: ', error);
}

export default db;