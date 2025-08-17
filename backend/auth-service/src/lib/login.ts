import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getUserByEmail } from './utils.js';
import { registerBody, authUser } from "../types/fastify.js";
import { sendTwoFactorCode } from './sendTwoFA.js';
import { createTwoFactorCode } from './twoFactorCode.js';
import bcrypt from 'bcrypt';


export async function login(
	req: FastifyRequest<{ Body: registerBody }>,
	reply: FastifyReply) {
		const { email, password } = req.body;
		try{
			const user = await userLogin(email, password);
			if (!user)
				return reply.status(404).send({ error: 'User not found'});
			console.log('USER = ', user);
			const code = await createTwoFactorCode(user.userId);
			await sendTwoFactorCode(user.email, code);
		//	await req.server.usersClient.setOnlineStatus(user_id, true);
			console.log('USER_ID IN LOGIN = ', user.userId);
			return reply.status(200).send({ userId: user.userId, message: 'User connected'} );
		} catch (error: any) {
			return reply.status(400).send({ error: error.message } );
		}
}

async function userLogin(email: string, password: string) {
	const user = getUserByEmail(email) as authUser | undefined ;
	if (!user)
		return false;
//	console.log('PASSWORD = ', password, 'HASH = ', user.hashed_password);
	console.log('getUserbyEmail = ', user);
	const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
//	console.log('BCRYPT = ', passwordMatch);
	if (!passwordMatch)
		throw new Error('Wrong password');
	return { 
		userId: user.userId,
		email: user.email
	 };
}