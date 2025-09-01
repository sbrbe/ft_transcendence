import { FastifyInstance } from "fastify";
import searchUser from "../lib/searchUser";

export async function searchUserRoute(app: FastifyInstance) {
	app.get<{
		Body: { username: string };
		Reply:
			| { userId: string, username: string, avatarPath: string }
			| { error: string };}>
			('/searchUser', {
		preHandler: app.authenticate,
		schema: {
			body: {
				type: 'object',
				required: ['username'],
				properties: {
					username: { type: 'string', minLength: 1, maxLength: 20 }
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['userId', 'username', 'avatarPath'],
					properties: {
						userId: { type: 'string', format: 'uuid' },
						username: { type: 'string', minLength: 1, maxLength: 20 },
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