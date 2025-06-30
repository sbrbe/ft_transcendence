"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
// db helpers typés :
const dbAll = (sql, params) => {
    return new Promise((resolve, reject) => {
        db_1.default.all(sql, params || [], (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};
const dbRun = (sql, params) => {
    return new Promise((resolve, reject) => {
        db_1.default.run(sql, params || [], function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
const friendsRoutes = async (fastify, opts) => {
    fastify.post('/request', async (req, res) => {
        const { requester_id, addressee_id } = req.body;
        try {
            const existing = await dbAll(`
        SELECT * FROM friendships
        WHERE 
          (requester_id = ? AND addressee_id = ?)
          OR
          (requester_id = ? AND addressee_id = ?)
      `, [requester_id, addressee_id, addressee_id, requester_id]);
            if (existing.length > 0) {
                const status = existing[0].status;
                if (status === 'accepted') {
                    return res.status(400).send({ error: "Vous êtes déjà amis." });
                }
                else if (status === 'pending') {
                    return res.status(409).send({ error: "Une demande est déjà en attente." });
                }
            }
            await dbRun(`
        INSERT INTO friendships (requester_id, addressee_id, status) 
        VALUES (?, ?, 'pending')
      `, [requester_id, addressee_id]);
            res.send({ success: true });
        }
        catch (err) {
            console.error("❌ Erreur insertion friendships :", err.message);
            if (err.message.includes('UNIQUE')) {
                res.status(409).send({ error: 'Demande déjà envoyée.' });
            }
            else {
                res.status(500).send({ error: 'Erreur : ' + err.message });
            }
        }
    });
    fastify.get('/incoming/:userId', async (req, res) => {
        const userId = req.params.userId;
        try {
            const rows = await dbAll(`
        SELECT f.id, f.requester_id, u.username, u.display_name
        FROM friendships f
        JOIN users u ON u.id = f.requester_id
        WHERE f.addressee_id = ? AND f.status = 'pending'
      `, [userId]);
            res.send(rows);
        }
        catch (err) {
            res.status(500).send({ error: err.message });
        }
    });
    fastify.get('/friends/:userId', async (req, res) => {
        const userId = req.params.userId;
        try {
            const rows = await dbAll(`
        SELECT f.*, u1.display_name as from_user, u2.display_name as to_user
        FROM friendships f
        JOIN users u1 ON u1.id = f.requester_id
        JOIN users u2 ON u2.id = f.addressee_id
        WHERE f.status = 'accepted' AND (f.requester_id = ? OR f.addressee_id = ?)
      `, [userId, userId]);
            res.send(rows);
        }
        catch (err) {
            res.status(500).send({ error: err.message });
        }
    });
    fastify.put('/accept/:id', async (req, res) => {
        const id = req.params.id;
        try {
            await dbRun(`UPDATE friendships SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
            res.send({ success: true });
        }
        catch (err) {
            res.status(500).send({ error: err.message });
        }
    });
    fastify.delete('/reject/:id', async (req, res) => {
        const id = req.params.id;
        try {
            await dbRun(`DELETE FROM friendships WHERE id = ?`, [id]);
            res.send({ success: true });
        }
        catch (err) {
            res.status(500).send({ error: err.message });
        }
    });
};
exports.default = friendsRoutes;
