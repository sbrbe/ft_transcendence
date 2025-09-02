"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initDB = initDB;
exports.saveMatch = saveMatch;
exports.getAllMatches = getAllMatches;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const crypto_1 = require("crypto");
function initDB() {
    if (exports.db)
        return (exports.db);
    try {
        exports.db = new better_sqlite3_1.default('./database/database.db');
        exports.db.exec(createMatchsTable);
        console.log('✅ SQLite Backend Online connected');
        return (exports.db);
    }
    catch (err) {
        console.error('❌ Error: database:', err.message);
        process.exit(1);
    }
}
const createMatchsTable = `CREATE TABLE IF NOT EXISTS matches (
		id TEXT PRIMARY KEY,
		player1 TEXT NOT NULL,
		player2 TEXT NOT NULL,
		score TEXT NOT NULL,
		total_exchanges INTEGER NOT NULL,
      	max_exchanges INTEGER NOT NULL,
		date TEXT NOT NULL		
		)`;
function saveMatch(input) {
    const id = input.id ?? (0, crypto_1.randomUUID)();
    const stmt = exports.db.prepare(`
				INSERT INTO matches (id, player1, player2, score, total_exchanges, max_exchanges, date)
				VALUES (?, ?, ?, ?, ?, ?, ?)
			  `);
    stmt.run(id, input.player1, input.player2, input.score, input.totalExchanges, input.maxExchanges, input.date);
    return id;
}
function getAllMatches() {
    const stmt = exports.db.prepare(`
			  SELECT id, player1, player2, score, total_exchanges, max_exchanges, date
			  FROM matches
			  ORDER BY rowid DESC
			`);
    return stmt.all();
}
