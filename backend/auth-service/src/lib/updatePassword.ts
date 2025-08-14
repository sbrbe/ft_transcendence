import { FastifyReply, FastifyRequest } from 'fastify';
import { getUserById } from './utils.js';
import db from '../init_db.js';
import bcrypt from 'bcrypt';


export async function updatePassword(
	req: FastifyRequest,
	reply: FastifyReply) {
		const { user_id } = req.params as { user_id: string };
		const { oldPassword, newPassword } = req.body as { oldPassword: string, newPassword: string };
		try {
			const updated = await updatePasswordService(user_id, oldPassword, newPassword);
			if (!updated) {
				return reply.status(404).send({ error: 'User not found' });
			}
			return reply.status(204).send();
		} catch (error) {
			return reply.status(400).send({ error: 'Wrong password' });
		}
}

async function updatePasswordService(user_id: string, oldPassword: string, newPassword: string) {
	const user = getUserById(user_id);
	if (!user)
		return false;
	const match = await bcrypt.compare(oldPassword, user.hashed_password);
	console.log('oldpassword_hashed = ', user.hashed_password, 'oldpassword = ', oldPassword);
	if (!match)
		throw new Error('Old password incorrect');
	const hash_new_pass = await bcrypt.hash(newPassword, 10);
	const stmt = db.prepare('UPDATE auth SET password = ?, hashed_password = ? WHERE user_id = ?');
	const res = stmt.run(newPassword, hash_new_pass, user_id);
	return res.changes > 0;
}