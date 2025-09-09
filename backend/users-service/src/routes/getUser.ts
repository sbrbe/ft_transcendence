import { FastifyInstance } from "fastify";
import { getUserProfile } from "../lib/getUser.js";

export default async function getUserRoute(app: FastifyInstance) {
	app.get<{
		Params: { userId: string };
		Reply: 
			| { lastName: string; firstName: string; username: string; avatarPath: string }
			| { error: string };}>
			('/getUser/:userId', {
		preHandler: app.authenticate,
		schema: {
			params: {
				type: 'object',
				required: ['userId'],
				properties: {
					userId: { type: 'string', format: 'uuid' }
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['lastName', 'firstName', 'username', 'avatarPath'],
					properties: {
						lastName: { type: 'string', minLength: 1, maxLength: 30 },
						firstName: { type: 'string', minLength: 1, maxLength: 30 },
						username: { type: 'string', minLength: 1, maxLength: 20 },
						avatarPath: { type: 'string', minLength: 1 }
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
	}, getUserProfile);	
}