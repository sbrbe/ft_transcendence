import { FastifyInstance } from "fastify";
import { getUserProfile } from "../lib/getUser.js";

export default async function getUserRoute(app: FastifyInstance) {
	app.get('/getUser/:userId', {
		schema: {
			description: 'Get user profile',
			params: {
				type: 'object',
				required: ['userId'],
				properties: {
					userId: { type: 'string', format: 'uuid'}
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['lastName', 'firstName', 'username', 'avatarUrl'],
					properties: {
						lastName: { type: 'string' },
						firstName: { type: 'string' },
						username: { type: 'string' },
						avatarUrl: { type: 'string' }
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