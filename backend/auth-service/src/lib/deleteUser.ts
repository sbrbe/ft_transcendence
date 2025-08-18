import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '../init_db.js';


export async function deleteUser( 
	req: FastifyRequest<{ Params: { userId: string } }>,
	reply: FastifyReply) {
		const { userId } = req.params;

		try {
			const deleted = deleteAuthUser(userId);
			if (!deleted)
				return reply.status(404).send({ error: 'User not found'});
			return reply.status(204).send();
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}

function deleteAuthUser(userId: string): boolean {
	const stmt = db.prepare('DELETE FROM auth WHERE userId = ?');
	const res = stmt.run(userId);
	return res.changes > 0;
}