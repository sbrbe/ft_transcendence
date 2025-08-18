import { FastifyReply, FastifyRequest } from 'fastify';
import { getUserById } from './utils.js';
import { db } from '../init_db.js';
import bcrypt from 'bcrypt';


export async function updatePassword(
	req: FastifyRequest,
	reply: FastifyReply) {
		const { userId } = req.params as { userId: string };
		const { oldPassword, newPassword } = req.body as { oldPassword: string, newPassword: string };
		try {
			const updated = await updatePasswordService(userId, oldPassword, newPassword);
			if (!updated) {
				return reply.status(404).send({ error: 'User not found' });
			}
			return reply.status(204).send();
		} catch (error: any) {
			return reply.status(400).send({ error: error.message });
		}
}

async function updatePasswordService(userId: string, oldPassword: string, newPassword: string) {
	const user = getUserById(userId);
	if (!user)
		return false;
	if (!strongPasswordRegex.test(newPassword))
		throw new Error ('Password too weak');

	const match = await bcrypt.compare(oldPassword, user.hashedPassword);
	console.log('oldpassword_hashed = ', user.hashedPassword, 'oldpassword = ', oldPassword);
	if (!match)
		throw new Error('Old password incorrect');
	const hashNewPass = await bcrypt.hash(newPassword, 10);
	const stmt = db.prepare('UPDATE auth SET password = ?, hashedPassword = ? WHERE userId = ?');
	const res = stmt.run(newPassword, hashNewPass, userId);
	return res.changes > 0;
}

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
