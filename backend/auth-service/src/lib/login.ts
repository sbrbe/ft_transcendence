import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getUserByEmail } from './utils.js';
import { registerBody, authUser } from "../types/fastify.js";
import bcrypt from 'bcrypt';


export async function login(
	req: FastifyRequest<{ Body: registerBody }>,
	reply: FastifyReply) {
		const { email, password } = req.body;
		try{
			const user_id = await userLogin(email, password);
		//	await req.server.usersClient.setOnlineStatus(user_id, true);
			console.log('USER_ID IN LOGIN = ', user_id);
			if (!user_id)
				return reply.status(404).send({ error: 'User not found'} );
			return reply.status(200).send({ user_id, message: 'User connected'} );
		} catch (error) {
			return reply.status(400).send({ error: 'Wrong infos'} );
		}
}

async function userLogin(email: string, password: string) {
	const user = getUserByEmail(email) as authUser | undefined ;
	if (!user)
		return false;
	console.log('PASSWORD = ', password, 'HASH = ', user.hashed_password);
	const passwordMatch = await bcrypt.compare(password, user.hashed_password);
	console.log('BCRYPT = ', passwordMatch);
	if (!passwordMatch)
		throw new Error('Wrong password');
	return (user.user_id)
}