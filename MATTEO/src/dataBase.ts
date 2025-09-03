import Database from "better-sqlite3";
import type { Database as Database_type} from "better-sqlite3";

export type tournoiValues = {
	tournoiId: number;
	snowtrace_link: string;
};

export let db: Database_type;

export function initDB()
{
	if (db)
		return (db);
	try
	{
		db = new Database('./database/database.db');
		db.exec(createTournamentTable);
		console.log('✅ SQLite AUTH_DB connected');
		return(db);
	}
	catch (err: any)
	{
		console.error('❌ Error: database:', err.message);
		process.exit(1);
	}
}

const createTournamentTable = 
	`CREATE TABLE IF NOT EXISTS tournaments (
        tournoiId INTEGER PRIMARY KEY,
        snowtrace_link TEXT NOT NULL
		)`;

export function saveValues(input: tournoiValues)
{
  const check = db.prepare("SELECT 1 FROM tournaments WHERE tournoiId = ?");
  const exists = check.get(input.tournoiId);

  if (!exists)
  {
    const stmt = db.prepare("INSERT INTO tournaments (tournoiId, snowtrace_link) VALUES (?, ?)");
    stmt.run(input.tournoiId, input.snowtrace_link);
  }
  else 
  {
    console.log(`⚠️ tournoiId ${input.tournoiId} existe déjà`);
  }
};

export function getValues()
{
	const stmt = db.prepare(`
		SELECT tournoiId, snowtrace_link
		FROM tournaments
		ORDER BY rowid DESC
	`);
	return (stmt.all());
}