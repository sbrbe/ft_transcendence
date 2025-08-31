import { FastifyRequest, FastifyReply } from "fastify";
import { deleteRefreshToken, clearAuthCookies } from "./createToken.js";
import { setOnlineStatus } from "./clientInternal.js";

export async function logout(
	req: FastifyRequest<{ Body: { userId: string } }>,
	reply: FastifyReply) {
		const { userId } = req.body;

		try {
			deleteRefreshToken(userId);
			clearAuthCookies(reply);
			await setOnlineStatus(userId, false);
			return reply.status(200).send({ userId, message: 'User disconnected' });
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}
