import { FastifyReply, FastifyRequest } from 'fastify';
import db from '../init_db.js';


export async function deleteUser( 
	req: FastifyRequest<{ Params: { user_id: string } }>,
	reply: FastifyReply) {
		const { user_id } = req.params;

		try {
			const deleted = deleteAuthUser(user_id);
			if (!deleted)
				return reply.status(404).send({ error: 'User not found'});
			return reply.status(204).send();
		} catch (error) {
			return reply.status(500).send({ error: 'Error while deleting' });
		}
}

function deleteAuthUser(user_id: string): boolean {
	const stmt = db.prepare('DELETE FROM auth WHERE user_id = ?');
	const res = stmt.run(user_id);
	return res.changes > 0;
}