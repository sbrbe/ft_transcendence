import Database from 'better-sqlite3'
import type { Database as Database_type} from 'better-sqlite3'
import { v4 as uuidv4} from 'uuid';


type SaveMatchInput = {
	player1: string;
	player2: string;
	score: string;
	totalExchanges: number;
	maxExchanges: number;
	id?: string;
	date: string;
};

export let db: Database_type;

export function initDB()
{
	try {
		db = new Database('./database/database.db');
		db.exec(createMatchsTable);
		console.log('✅ SQLite game-service Online connected')
	} catch (err: any) {
		console.error('❌ Error: database:', err.message);
		process.exit(1);
	}
}

const createMatchsTable =
	`CREATE TABLE IF NOT EXISTS matches (
		id TEXT PRIMARY KEY,
		player1 TEXT NOT NULL,
		player2 TEXT NOT NULL,
		score TEXT NOT NULL,
		total_exchanges INTEGER NOT NULL,
		max_exchanges INTEGER NOT NULL,
		date TEXT NOT NULL		
		)`;

export function saveMatch(input: SaveMatchInput): string {
	const id = input.id ?? uuidv4();
	const stmt = db.prepare(`
		INSERT INTO matches (id, player1, player2, score, total_exchanges, max_exchanges)
		VALUES (?, ?, ?, ?, ?, ?)
		`);
		stmt.run(
			id,
			input.player1,
			input.player2,
			input.score,
			input.totalExchanges,
			input.maxExchanges,
			input.date
			);
		return id;
}

export function getAllMatches() {
	const stmt = db.prepare(`
		SELECT id, player1, player2, score, total_exchanges, max_exchanges, date
		FROM matches
		ORDER BY rowid DESC
		`);
	return stmt.all();
} 

export function getMatchHistory(userId: string) {
	const stmt = db.prepare(`
		SELECT * FROM matches
		WHERE player1 = ? OR player2 = ?
		ORDER by createdAt DESC
		`);
	const macthes = stmt.all(userId, userId);
}