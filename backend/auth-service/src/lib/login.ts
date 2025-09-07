import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getUserByEmail, getUserById } from './utils.js';
import { registerBody, authUser, verify2FA } from "../types/fastify.js";
import { sendTwoFactorCode } from './sendTwoFA.js';
import { createTwoFactorCode, verifyTwoFactorCode } from './twoFactorCode.js';
import { setAuthCookies } from './createToken.js';
import { setOnlineStatus } from './clientInternal.js';
import bcrypt from 'bcrypt';


export async function loginVerify(
	req: FastifyRequest<{ Body: verify2FA }>,
	reply: FastifyReply) {
		const { userId, code } = req.body;
		const app = req.server as FastifyInstance;

		try {
//			await verifyTwoFactorCode(userId, code);
			const user = getUserById(userId)
			if (!user) {
				return reply.status(404).send({ error: 'User not found' });
			}
			await setAuthCookies(reply, user.userId);
			await setOnlineStatus(user.userId, true);
			return reply.status(200).send({ message: '2FA valid' });
		} catch (error: any) {
			return reply.status(401).send({ error: error.message });
		}
}


export async function login(
	req: FastifyRequest<{ Body: registerBody }>,
	reply: FastifyReply) {
		const { email, password } = req.body;
		try{
			const user = await userLogin(email, password);
			if (!user)
				return reply.status(404).send({ error: 'User not found'});
			console.log('USER = ', user);
//			const code = await createTwoFactorCode(user.userId);
//			await sendTwoFactorCode(user.userId, user.email, code);
			return reply.status(200).send({ userId: user.userId, message: '2FA code sent by mail'} );
		} catch (error: any) {
			return reply.status(400).send({ error: error.message } );
		}
}

async function userLogin(email: string, password: string) {
	const user = getUserByEmail(email) as authUser | undefined ;
	if (!user)
		return false;
	console.log('getUserbyEmail = ', user);
	const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
	if (!passwordMatch)
		throw new Error('Wrong password');
	return { 
		userId: user.userId,
		email: user.email
	 };
}