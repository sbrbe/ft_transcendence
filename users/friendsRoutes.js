// friendsRoutes.js
module.exports = async function (fastify, opts) {
	const db = require('./db'); // PAS './app'
	const util = require('util');
	const dbRun = util.promisify(db.run).bind(db);
  
	fastify.post('/request', async (req, res) => {
	  const { requester_id, addressee_id } = req.body;
	  try {
		await dbRun(`
		  INSERT INTO friendships (requester_id, addressee_id, status) 
		  VALUES (?, ?, 'pending')
		`, [requester_id, addressee_id]);
		res.send({ success: true });
	  } catch (err) {
		console.error("❌ Erreur insertion dans friendships :", err.message); // ← ajoute ça
		if (err.message.includes('UNIQUE')) {
		  res.status(409).send({ error: 'Demande déjà envoyée.' });
		} else {
		  res.status(500).send({ error: 'Erreur : ' + err.message });
		}
	  }
	});
	
	fastify.get('/incoming/:userId', async (req, res) => {
	const userId = req.params.userId;
	try {
		const rows = await db.all(`
			SELECT f.id, f.requester_id, u.username, u.display_name
			FROM friendships f
			JOIN users u ON u.id = f.requester_id
			WHERE f.addressee_id = ? AND f.status = 'pending'
			`, [userId]);
			res.send(rows);
		} catch (err) {
			res.status(500).send({ error: err.message });
		}
	});
	
	fastify.get('/friends/:userId', async (req, res) => {
		const userId = req.params.userId;
		try {
			const rows = await db.all(`
				SELECT f.*, u1.display_name as from_user, u2.display_name as to_user
				FROM friendships f
				JOIN users u1 ON u1.id = f.requester_id
				JOIN users u2 ON u2.id = f.addressee_id
				WHERE f.status = 'accepted' AND (f.requester_id = ? OR f.addressee_id = ?)
	  `, [userId, userId]);
	  res.send(rows);
	} catch (err) {
		res.status(500).send({ error: err.message });
	}
});

fastify.put('/accept/:id', async (req, res) => {
	const id = req.params.id;
	try {
		await dbRun(`UPDATE friendships SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
		res.send({ success: true });
	} catch (err) {
		res.status(500).send({ error: err.message });
	}
});

fastify.delete('/reject/:id', async (req, res) => {
	const id = req.params.id;
	try {
		await dbRun(`DELETE FROM friendships WHERE id = ?`, [id]);
		res.send({ success: true });
	} catch (err) {
		res.status(500).send({ error: err.message });
	}
});

};