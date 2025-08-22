import Database from 'better-sqlite3'
import type { Database as Database_type} from 'better-sqlite3'

export let db: Database_type;

export function initDB() {
	try {
		db = new Database('./database/database.db', { verbose: console.log});

		db.exec(createUsersTable);
		db.exec(createFriendshipsTable);

		console.log('✅ SQLite USER_DB connected')
	} catch (err: any) {
		console.error('❌ Error: database:', err.message);
		process.exit(1);
	}
}

const createUsersTable =
	`CREATE TABLE IF NOT EXISTS users (
		userId TEXT PRIMARY KEY,
		firstName TEXT,
		lastName TEXT,
		username TEXT,
		avatarUrl TEXT,
		isOnline BOOLEAN DEFAULT FALSE
		)`;

const createFriendshipsTable = 
	`CREATE TABLE IF NOT EXISTS friendships (
		userId TEXT PRIMARY KEY,
		requesterId TEXT NOT NULL,
		addresseeId TEXT NOT NULL,
		status TEXT NOT NULL DEFAULT 'pending'
		)`;