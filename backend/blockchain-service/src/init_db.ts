import Database from "better-sqlite3";
import type { Database as Database_type} from "better-sqlite3";
import { tournoiValues } from "./types/fastify";

export let db: Database_type;

export function initDB()
{
	try
	{
		db = new Database('./database/database.db', { verbose: console.log});
		db.exec(createTournamentTable);
		console.log('✅ SQLite AUTH_DB connected');
	}
	catch (err: any)
	{
		console.error('❌ Error: database:', err.message);
		process.exit(1);
	}
}

const createTournamentTable = 
	`CREATE TABLE IF NOT EXISTS tournaments (
		tournamentId TEXT PRIMARY KEY,
		userId TEXT NOT NULL,
		snowtraceLink TEXT NOT NULL,
		players TEXT NOT NULL DEFAULT '[]',
		date TEXT NOT NULL
	)`;

export function saveValues(input: tournoiValues)
{
	const check = db.prepare("SELECT 1 FROM tournaments WHERE tournamentId = ?");
	const exists = check.get(input.tournamentId);

	if (!exists)
	{
		const stmt = db.prepare("INSERT INTO tournaments (tournamentId, userId, snowtraceLink, players, date) VALUES (?, ?, ?, ?, ?)");
		stmt.run(input.tournamentId, input.userId, input.snowtraceLink, JSON.stringify(input.players ?? []), new Date().toISOString().slice(0, 10));
	console.log(`✅ tournamentId ${input.tournamentId} créé`);
	}
	else 
	{
		console.log(`⚠️ tournamentId ${input.tournamentId} existe déjà`);
	}
}
// VERIFIER SI ON S'EN SERT
type TournamentItem = {
	tournmanentId: string;
	snowtraceLink: number;
	players: string[];
};

type TournamentHistory = {
	history: TournamentItem[];
};


export function getValues(userId: string): TournamentHistory[] {
	const rows = db.prepare(`
		SELECT *
		FROM tournaments
		WHERE userId = ?
		ORDER BY rowid DESC
	`).all(userId) as TournamentHistory[];

	return rows;
}
