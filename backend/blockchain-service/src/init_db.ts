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
        userId TEXT PRIMARY KEY,
		tournoiId 
        snowtrace_link TEXT NOT NULL
		players TEXT NOT NULL '[]'
		)`;

export function saveValues(input: tournoiValues)
{
  const check = db.prepare("SELECT 1 FROM tournaments WHERE userId = ?");
  const exists = check.get(input.userId);

  if (!exists)
  {
    const stmt = db.prepare("INSERT INTO tournaments (userId, snowtrace_link) VALUES (?, ?)");
    stmt.run(input.userId, input.snowtrace_link);
  }
  else 
  {
    console.log(`⚠️ userId ${input.userId} existe déjà`);
  }
};

export function addSnowtraceLink(userId: string, link: string): string[]
{
	const tx: (uid: string, l: string) => string[] = db.transaction((uid: string, l: string): string[] =>
	{
		const row = db
			.prepare("SELECT snowtrace_link FROM tournaments WHERE userId = ?")
        	.get(uid) as { snowtrace_links: string } | undefined;
		
		const links: string[] = row ? JSON.parse(row.snowtrace_links) : [];
		
		if (!links.includes(l))
			links.push(l);

      	const json = JSON.stringify(links);

      	if (row)
	  	{
        	db.prepare("UPDATE player_tournaments SET snowtrace_links = ? WHERE user_id = ?").run(json, uid);
      	}
	  	else
	  	{
        	db.prepare("INSERT INTO player_tournaments (user_id, snowtrace_links) VALUES (?, ?)").run(uid, json);
      	}

      	return links;
    });

	return tx(userId, link);
}


export function getValues()
{
	const stmt = db.prepare(`
		SELECT userId, snowtrace_link
		FROM tournaments
		ORDER BY rowid DESC
	`);
	return (stmt.all());
}