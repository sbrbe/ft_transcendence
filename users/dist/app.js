"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
const friendsRoutes_1 = __importDefault(require("./friendsRoutes"));
const db_1 = __importDefault(require("./db"));
require("./createTables");
// Crée ton instance Fastify
const app = (0, fastify_1.default)({ logger: true });
// Promisify SQLite
const dbGet = (sql, params) => new Promise((resolve, reject) => {
    db_1.default.get(sql, params, (err, row) => {
        if (err)
            reject(err);
        else
            resolve(row);
    });
});
const dbAll = (sql, params) => new Promise((resolve, reject) => {
    db_1.default.all(sql, params, (err, rows) => {
        if (err)
            reject(err);
        else
            resolve(rows);
    });
});
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
// Enregistre routes friends
app.register(friendsRoutes_1.default, { prefix: '/friends' });
// 🔎 GET /ma-route
app.get('/ma-route', async (request, reply) => {
    try {
        const users = await dbAll('SELECT * FROM users');
        const friendships = await dbAll('SELECT * FROM friendships');
        const matches = await dbAll('SELECT * FROM matches');
        return reply.send({ users, friendships, matches });
    }
    catch (err) {
        return reply.status(500).send({ error: err.message });
    }
});
// ✅ POST /
app.post('/', (request, reply) => {
    const { first_name, last_name, username, password, email, display_name, avatar_url } = request.body;
    if (!first_name || !last_name || !username || !password || !email || !display_name) {
        return reply.status(400).send({ error: "Champs requis manquants." });
    }
    if (!validator_1.default.isEmail(email)) {
        return reply.status(400).send({ error: "Email invalide." });
    }
    if (password.length < 8 || !strongPasswordRegex.test(password)) {
        return reply.status(400).send({ error: "Mot de passe trop faible." });
    }
    const checkSQL = `SELECT * FROM users WHERE email = ? OR username = ?`;
    db_1.default.get(checkSQL, [email, username], (err, existingUser) => {
        if (err)
            return reply.status(500).send({ error: err.message });
        if (existingUser) {
            if (existingUser.email === email)
                return reply.status(409).send({ error: "Email déjà utilisé." });
            if (existingUser.username === username)
                return reply.status(409).send({ error: "Nom d'utilisateur déjà pris." });
        }
        bcrypt_1.default.hash(password, 10).then(hashedPassword => {
            const finalAvatar = avatar_url || '/default.png';
            const insertSQL = `INSERT INTO users (
        first_name, last_name, username, password, email, display_name, avatar_url, is_online, last_seen
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db_1.default.run(insertSQL, [first_name, last_name, username, hashedPassword, email, display_name, finalAvatar, 1, new Date().toISOString()], function (err) {
                if (err)
                    return reply.status(500).send({ error: err.message });
                const newUserId = this.lastID;
                db_1.default.get(`
          SELECT id, first_name, last_name, username, email, display_name,
                 avatar_url, wins, losses, last_seen, created_at
          FROM users WHERE id = ?
        `, [newUserId], (err, user) => {
                    if (err)
                        return reply.status(500).send({ error: err.message });
                    return reply.status(201).send(user);
                });
            });
        }).catch(() => {
            return reply.status(500).send({ error: "Erreur lors du hash du mot de passe." });
        });
    });
});
// ✅ POST /login
app.post('/login', (request, reply) => {
    const { email, password } = request.body;
    if (!email || !password) {
        return reply.status(400).send({ error: "Champs requis manquants." });
    }
    db_1.default.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err)
            return reply.status(500).send({ error: err.message });
        if (!user)
            return reply.status(404).send({ error: "Utilisateur non trouvé." });
        bcrypt_1.default.compare(password, user.password, (err, match) => {
            if (err)
                return reply.status(500).send({ error: "Erreur de vérification du mot de passe." });
            if (!match)
                return reply.status(401).send({ error: "Mot de passe incorrect." });
            db_1.default.run(`UPDATE users SET is_online = 1, last_seen = datetime('now') WHERE id = ?`, [user.id], err => {
                if (err)
                    console.error("⚠️ Erreur mise à jour online:", err.message);
            });
            reply.send({
                id: user.id,
                email: user.email,
                username: user.username,
                display_name: user.display_name,
                avatar_url: user.avatar_url,
                first_name: user.first_name,
                last_name: user.last_name,
                wins: user.wins,
                losses: user.losses,
                last_seen: user.last_seen,
                created_at: user.created_at
            });
        });
    });
});
// ✅ PUT /users/:id
app.put('/users/:id', (request, reply) => {
    const userId = request.params.id;
    const { first_name, last_name, email, display_name, avatar_url } = request.body;
    if (!first_name && !last_name && !email && !display_name && !avatar_url) {
        return reply.status(400).send({ error: "Aucune donnée à mettre à jour." });
    }
    const fields = [];
    const values = [];
    if (first_name) {
        fields.push("first_name = ?");
        values.push(first_name);
    }
    if (last_name) {
        fields.push("last_name = ?");
        values.push(last_name);
    }
    if (email) {
        fields.push("email = ?");
        values.push(email);
    }
    if (display_name) {
        fields.push("display_name = ?");
        values.push(display_name);
    }
    if (avatar_url && avatar_url.trim() !== "") {
        fields.push("avatar_url = ?");
        values.push(avatar_url.trim());
    }
    values.push(userId);
    const updateSQL = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    db_1.default.run(updateSQL, values, function (err) {
        if (err)
            return reply.status(500).send({ error: err.message });
        if (this.changes === 0)
            return reply.status(404).send({ error: "Utilisateur non trouvé." });
        db_1.default.get(`SELECT id, first_name, last_name, email, display_name, avatar_url, wins, losses, created_at FROM users WHERE id = ?`, [userId], (err, updatedUser) => {
            if (err)
                return reply.status(500).send({ error: err.message });
            return reply.send(updatedUser);
        });
    });
});
// ✅ GET /users/:id
app.get('/users/:id', async (request, reply) => {
    const userId = request.params.id;
    try {
        const user = await dbGet(`
      SELECT id, first_name, last_name, username, email, display_name,
             avatar_url, wins, losses, last_seen, is_online, created_at
      FROM users WHERE id = ?
    `, [userId]);
        if (!user)
            return reply.status(404).send({ error: "Utilisateur non trouvé." });
        return reply.send(user);
    }
    catch (err) {
        return reply.status(500).send({ error: "Erreur serveur : " + err.message });
    }
});
// ✅ POST /logout
app.post('/logout', (request, reply) => {
    const { id } = request.body;
    if (!id)
        return reply.status(400).send({ error: "ID requis" });
    db_1.default.run(`UPDATE users SET is_online = 0 WHERE id = ?`, [id], err => {
        if (err)
            return reply.status(500).send({ error: err.message });
        return reply.send({ message: "Utilisateur déconnecté." });
    });
});
// ✅ GET /users/search
app.get('/users/search', async (request, reply) => {
    const q = request.query.q;
    if (!q || q.trim() === '') {
        return reply.status(400).send({ error: 'Requête vide.' });
    }
    try {
        const users = await dbAll(`
      SELECT id, username, display_name, avatar_url FROM users
      WHERE username LIKE ? OR display_name LIKE ?
      LIMIT 10
    `, [`%${q}%`, `%${q}%`]);
        reply.send(users);
    }
    catch (err) {
        reply.status(500).send({ error: 'Erreur serveur : ' + err.message });
    }
});
// ✅ POST /update-password
app.post('/update-password', (request, reply) => {
    const { oldPassword, newPassword, id } = request.body;
    const userId = id;
    if (newPassword.length < 8 || !strongPasswordRegex.test(newPassword)) {
        return reply.status(400).send({ error: "Nouveau mot de passe trop faible." });
    }
    db_1.default.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err)
            return reply.status(500).send({ error: err.message });
        bcrypt_1.default.compare(oldPassword, user.password, (err, same) => {
            if (!same)
                return reply.status(401).send({ error: "Ancien mot de passe incorrect." });
            bcrypt_1.default.hash(newPassword, 10, (err, hashed) => {
                db_1.default.run('UPDATE users SET password = ? WHERE id = ?', [hashed, userId], err => {
                    if (err)
                        return reply.status(500).send({ error: err.message });
                    return reply.send({ message: "Mot de passe mis à jour !" });
                });
            });
        });
    });
});
// ✅ POST /matches
app.post('/matches', (request, reply) => {
    const { user_id, opponent_id, result } = request.body;
    if (!user_id || !opponent_id || !result) {
        return reply.status(400).send({ error: "Champs requis manquants." });
    }
    const insertSQL = `
    INSERT INTO matches (user_id, opponent_id, result)
    VALUES (?, ?, ?)
  `;
    db_1.default.run(insertSQL, [user_id, opponent_id, result], function (err) {
        if (err)
            return reply.status(500).send({ error: err.message });
        reply.send({ message: "Match enregistré.", match_id: this.lastID });
    });
});
// ✅ GET /users/:id/matches
app.get('/users/:id/matches', (request, reply) => {
    const userId = request.params.id;
    const selectSQL = `
    SELECT * FROM matches
    WHERE user_id = ? OR opponent_id = ?
    ORDER BY date_played DESC
  `;
    db_1.default.all(selectSQL, [userId, userId], (err, rows) => {
        if (err)
            return reply.status(500).send({ error: err.message });
        reply.send({ matches: rows });
    });
});
// ✅ Lancer
app.listen({ port: 3001, host: '0.0.0.0' }, err => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log('✅ Microservice users running (TypeScript) on port 3001');
});
exports.default = app;
