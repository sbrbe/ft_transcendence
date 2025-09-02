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
		firstName TEXT NOT NULL,
		lastName TEXT NOT NULL,
		username TEXT NOT NULL,
		avatarPath TEXT NOT NULL,
		avatarEtag TEXT,
		isOnline BOOLEAN DEFAULT FALSE,
		lastLogin DATETIME,
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
		)`;

const createFriendshipsTable = 
	`CREATE TABLE IF NOT EXISTS friendships (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		userId TEXT NOT NULL,
		friendId TEXT NOT NULL,
		status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(userId, friendId)
		)`;