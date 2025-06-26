// === app.js (Fastify + SQLite) ===

const Fastify = require('fastify');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = Fastify({ logger: true });
const util = require('util');



const db = require('./db');

const dbGet = util.promisify(db.get).bind(db);

const friendsRoutes = require('./friendsRoutes');
app.register(friendsRoutes, { prefix: '/friends' });
require('./createTables');

const createTableSQL = `CREATE TABLE IF NOT EXISTS users (
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
  is_online INTEGER DEFAULT 0,  -- 0 = hors ligne, 1 = en ligne
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;


db.run(createTableSQL, (err) => {
  if (err) console.error("❌ Table creation failed:", err.message);
  else console.log("✅ Table 'users' ready.");
});

// GET /ma-route
const dbAll = util.promisify(db.all).bind(db);

app.get('/ma-route', async (request, reply) => {
  try {
    const users = await dbAll('SELECT * FROM users');
    const friendships = await dbAll('SELECT * FROM friendships');

    return reply.send({
      users,
      friendships
    });

  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
});




// POST /
app.post('/', (request, reply) => {
	const { first_name, last_name, username, password, email, display_name, avatar_url } = request.body;
  
	if (!first_name || !last_name || !username || !password || !email || !display_name) {
	  return reply.status(400).send({ error: "Champs requis manquants." });
	}
  
	const checkSQL = `SELECT * FROM users WHERE email = ? OR username = ?`;
	db.get(checkSQL, [email, username], (err, existingUser) => {
	  if (err) return reply.status(500).send({ error: err.message });
  
	  if (existingUser) {
		if (existingUser.email === email) return reply.status(409).send({ error: "Email déjà utilisé." });
		if (existingUser.username === username) return reply.status(409).send({ error: "Nom d'utilisateur déjà pris." });
	  }

	  bcrypt.hash(password, 10).then((hashedPassword) => {
		const finalAvatar = avatar_url || '/default.png';
		const insertSQL = `INSERT INTO users (
      first_name, last_name, username, password, email, display_name, avatar_url, is_online
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(insertSQL, [first_name, last_name, username, hashedPassword, email, display_name, finalAvatar, 1], function (err)
    {
      if (err) return reply.status(500).send({ error: err.message });
    
      const newUserId = this.lastID;
    
      const selectSQL = `
        SELECT id, first_name, last_name, username, email, display_name,
               avatar_url, wins, losses, last_seen, created_at
        FROM users
        WHERE id = ?
      `;
      db.get(selectSQL, [newUserId], (err, user) => {
        if (err) return reply.status(500).send({ error: err.message });
        return reply.status(201).send(user);
      });
    });
    
	  }).catch((err) => {
		return reply.status(500).send({ error: "Erreur lors du hash du mot de passe." });
	  });
	});
});
  

// POST /login
app.post('/login', (request, reply) => {
  const { email, password } = request.body;

  if (!email || !password) {
    reply.status(400).send({ error: "Champs requis manquants." });
    return;
  }
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) {
      reply.status(500).send({ error: err.message });
      return;
    }
    if (!user) {
      reply.status(404).send({ error: "Utilisateur non trouvé." });
      return;
    }
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        reply.status(500).send({ error: "Erreur de vérification du mot de passe." });
        return;
      }
      if (!match) {
        reply.status(401).send({ error: "Mot de passe incorrect." });
        return;
      }
      db.run(`UPDATE users SET is_online = 1, last_seen = datetime('now') WHERE id = ?`, [user.id], (err) => {
        if (err) console.error("⚠️ Erreur mise à jour online:", err.message);
      });
      
      // ✅ Réponse envoyée une seule fois
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


app.put('/users/:id', (request, reply) => {
  const userId = request.params.id;
  const {
    first_name,
    last_name,
    email,
    display_name,
    avatar_url
  } = request.body;

  // Vérifie qu'il y a au moins une donnée à modifier
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
  if (avatar_url !== undefined && avatar_url.trim() !== "") {
    fields.push("avatar_url = ?");
    values.push(avatar_url.trim());
  }  

  values.push(userId); // pour WHERE id = ?

  const updateSQL = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

  db.run(updateSQL, values, function (err) {
    if (err) {
      return reply.status(500).send({ error: err.message });
    }

    if (this.changes === 0) {
      return reply.status(404).send({ error: "Utilisateur non trouvé." });
    }

    // Récupère les infos mises à jour pour les renvoyer
    db.get(
      `SELECT id, first_name, last_name, email, display_name, avatar_url, wins, losses, created_at FROM users WHERE id = ?`,
      [userId],
      (err, updatedUser) => {
        if (err) return reply.status(500).send({ error: err.message });
        return reply.send(updatedUser);
      }
    );    
  });
});

// GET /users/:id - Voir le profil d'un utilisateur
app.get('/users/:id', async (request, reply) => {
  const userId = request.params.id;

  try {
    const user = await dbGet(`
      SELECT id, first_name, last_name, username, email, display_name,
             avatar_url, wins, losses, last_seen, is_online, created_at
      FROM users
      WHERE id = ?
    `, [userId]);

    if (!user) {
      return reply.status(404).send({ error: "Utilisateur non trouvé." });
    }

    return reply.send(user);

  } catch (err) {
    return reply.status(500).send({ error: "Erreur serveur : " + err.message });
  }
});

// POST /logout
app.post('/logout', (request, reply) => {
  const { id } = request.body;
  if (!id) return reply.status(400).send({ error: "ID requis" });

  db.run(`UPDATE users SET is_online = 0 WHERE id = ?`, [id], function (err) {
    if (err) return reply.status(500).send({ error: err.message });
    return reply.send({ message: "Utilisateur déconnecté." });
  });
});




app.listen({ port: 3001, host: '0.0.0.0' }, err => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('✅ Microservice users running on port 3001');
});

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
  } catch (err) {
    reply.status(500).send({ error: 'Erreur serveur : ' + err.message });
  }
});

    module.exports = app;