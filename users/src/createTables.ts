import sqlite3 from 'sqlite3';
import db from './db';

const createTableSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT DEFAULT '/default.png',
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    last_seen DATETIME,
    is_online INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.run(createTableSQL, (err: Error | null) => {
  if (err) console.error("❌ Table creation failed:", err.message);
  else console.log("✅ Table 'users' ready.");
});

const createFriendshipsTable = `
  CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL,
    addressee_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (addressee_id) REFERENCES users(id),
    UNIQUE (requester_id, addressee_id)
  )
`;

db.run(createFriendshipsTable, (err: Error | null) => {
  if (err) console.error('❌ Erreur création friendships :', err.message);
  else console.log('✅ Table friendships OK');
});

const createMatchesTableSQL = `
  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    opponent_id INTEGER,
    result TEXT,
    date_played DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (opponent_id) REFERENCES users(id)
  )
`;

db.run(createMatchesTableSQL, (err: Error | null) => {
  if (err) console.error("❌ Erreur création table matches :", err.message);
  else console.log("✅ Table 'matches' prête.");
});
