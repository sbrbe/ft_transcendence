"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
// Ouvre la base avec options : lecture + écriture + création si pas là
const db = new sqlite3_1.default.Database('./src/sqlite/db.sqlite', sqlite3_1.default.OPEN_READWRITE | sqlite3_1.default.OPEN_CREATE, (err) => {
    if (err)
        console.error("❌ DB Connection Error:", err.message);
    else
        console.log("✅ SQLite DB connected");
});
exports.default = db;
