const db = require('./db');

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
)`;

db.run(createFriendshipsTable, (err) => {
  if (err) console.error('❌ Erreur création friendships :', err.message);
  else console.log('✅ Table friendships OK');
});
