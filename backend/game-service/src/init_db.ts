import Database from 'better-sqlite3'
import type { Database as Database_type} from 'better-sqlite3'
import { v4 as uuidv4} from 'uuid';


export type SaveMatchInput = {
	id?: string;
	winner: string;
	loser: string;
	winnerScore: number;
	loserScore: number;
	totalExchanges: number;
	maxExchanges: number;
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
		winner TEXT NOT NULL,
		loser TEXT NOT NULL,
		winnerScore INTEGER NOT NULL,
		loserScore INTEGER NOT NULL,
		totalExchanges INTEGER NOT NULL,
		maxExchanges INTEGER NOT NULL,
		date TEXT NOT NULL		
		)`;

export function saveMatch(input: SaveMatchInput): string {
	const id = input.id ?? uuidv4();
	const stmt = db.prepare(`
		INSERT INTO matches (id, winner, loser, winnerScore, loserScore, totalExchanges, maxExchanges, date)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`);
		stmt.run(
			id,
			input.winner,
			input.loser,
			input.winnerScore,
			input.loserScore,
			input.totalExchanges,
			input.maxExchanges,
			input.date
			);
		return id;
}