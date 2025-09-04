import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import db from './db';


// db helpers typés :
const dbAll = (sql: string, params?: any[]) => {
  return new Promise<any[]>((resolve, reject) => {
    db.all(sql, params || [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql: string, params?: any[]) => {
  return new Promise<void>((resolve, reject) => {
    db.run(sql, params || [], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
};


interface FriendRequestBody {
  requester_id: number;
  addressee_id: number;
}

interface UserIdParams {
  userId: string;
}

interface IdParams {
  id: string;
}

const friendsRoutes = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) => {

  fastify.post('/request', async (req: FastifyRequest, res: FastifyReply) => {
    const { requester_id, addressee_id } = req.body as FriendRequestBody;

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
        } else if (status === 'pending') {
          return res.status(409).send({ error: "Une demande est déjà en attente." });
        }
      }

      await dbRun(`
        INSERT INTO friendships (requester_id, addressee_id, status) 
        VALUES (?, ?, 'pending')
      `, [requester_id, addressee_id]);

      res.send({ success: true });

    } catch (err: any) {
      console.error("❌ Erreur insertion friendships :", err.message);
      if (err.message.includes('UNIQUE')) {
        res.status(409).send({ error: 'Demande déjà envoyée.' });
      } else {
        res.status(500).send({ error: 'Erreur : ' + err.message });
      }
    }
  });

  fastify.get('/incoming/:userId', async (req: FastifyRequest, res: FastifyReply) => {
    const userId = (req.params as UserIdParams).userId;
    try {
      const rows = await dbAll(`
        SELECT f.id, f.requester_id, u.username, u.display_name
        FROM friendships f
        JOIN users u ON u.id = f.requester_id
        WHERE f.addressee_id = ? AND f.status = 'pending'
      `, [userId]);
      res.send(rows);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  });
  fetch ('/users/friends/:userId')

  fastify.get('/friends/:userId', async (req: FastifyRequest, res: FastifyReply) => {
    const userId = (req.params as UserIdParams).userId;
    try {
      const rows = await dbAll(`
        SELECT f.*, u1.display_name as from_user, u2.display_name as to_user
        FROM friendships f
        JOIN users u1 ON u1.id = f.requester_id
        JOIN users u2 ON u2.id = f.addressee_id
        WHERE f.status = 'accepted' AND (f.requester_id = ? OR f.addressee_id = ?)
      `, [userId, userId]);
      res.send(rows);
    } catch (err: any) {
      console.error("❌ Erreur SQL /friends:", err.message);
      res.send([]); // Renvoie un tableau vide au lieu d'un objet
    }    
  });

  fastify.put('/accept/:id', async (req: FastifyRequest, res: FastifyReply) => {
    const id = (req.params as IdParams).id;
    try {
      await dbRun(`UPDATE friendships SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
      res.send({ success: true });
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  });

  fastify.delete('/reject/:id', async (req: FastifyRequest, res: FastifyReply) => {
    const id = (req.params as IdParams).id;
    try {
      await dbRun(`DELETE FROM friendships WHERE id = ?`, [id]);
      res.send({ success: true });
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  });
};

export default friendsRoutes;
