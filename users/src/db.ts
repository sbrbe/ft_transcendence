import sqlite3 from 'sqlite3';

// Ouvre la base avec options : lecture + écriture + création si pas là
const db = new sqlite3.Database(
  './users/src/sqlite/db.sqlite',
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err: Error | null) => {
    if (err) console.error("❌ DB Connection Error:", err.message);
    else console.log("✅ SQLite DB connected");
  }
);

export default db;
