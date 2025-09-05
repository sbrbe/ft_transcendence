import Database from "better-sqlite3";
import type { Database as Database_type} from "better-sqlite3";
import { tournoiValues } from "./types/fastify";

export let db: Database_type;

export function initDB()
{
	try
	{
		db = new Database('./database/database.db');
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
    snowtrace_link TEXT NOT NULL,
		players TEXT NOT NULL DEFAULT '[]'
		)`;

export function saveValues(input: tournoiValues)
{
  const check = db.prepare("SELECT 1 FROM tournaments WHERE tournamentId = ?");
  const exists = check.get(input.tournamentId);

  if (!exists)
  {
    const stmt = db.prepare("INSERT INTO tournaments (tournamentId, userId, snowtrace_link, players) VALUES (?, ?, ?, ?)");
    stmt.run(input.tournamentId, input.userId, input.snowtrace_link, JSON.stringify(input.players ?? []));
	console.log(`✅ tournamentId ${input.tournamentId} créé`);
  }
  else 
  {
    console.log(`⚠️ tournamentId ${input.tournamentId} existe déjà`);
  }
}

export function getValues(userId: string): Array<tournoiValues> {
  const rows = db.prepare(`
    SELECT tournamentId, userId, snowtrace_link, players
    FROM tournaments
    WHERE userId = ?
    ORDER BY rowid DESC
  `).all(userId) as Array<{ tournamentId: string; userId: string; snowtrace_link: string; players: string }>;

  return rows.map(r => ({
    tournamentId: r.tournamentId,
    userId: r.userId,
    snowtrace_link: r.snowtrace_link,
    players: safeParsePlayers(r.players),
  }));
}

function safeParsePlayers(json: string): string[] {
  try
  {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  }
  catch
  {
    return [];
  }
}