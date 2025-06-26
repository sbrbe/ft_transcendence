// db.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./sqlite/db.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) console.error("❌ DB Connection Error:", err.message);
  else console.log("✅ SQLite DB connected");
});

module.exports = db;
