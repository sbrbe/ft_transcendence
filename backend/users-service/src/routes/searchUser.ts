import { FastifyInstance } from "fastify";
import searchUser from "../lib/searchUser.js";

export async function searchUserRoute(app: FastifyInstance) {
	app.get<{
		Params: { username: string };
		Reply:
			| { userId: string, avatarPath: string }
			| { error: string };}>
			('/friends/searchUser/:username', {
		preHandler: app.authenticate,
		schema: {
			params: {
				type: 'object',
				required: ['username'],
				properties: {
					username: { type: 'string', minLength: 1, maxLength: 20 }
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['userId', 'avatarPath'],
					properties: {
						userId: { type: 'string', format: 'uuid' },
						avatarPath: { type: 'string' }
					}
				},
				404: {
					type: 'object',
					properties: {
						error: { type: 'string' }
					}
				},
				500: {
					type: 'object',
					properties: {
						error: { type: 'string' }
					}
				}
			},
		}
	}, searchUser);
}