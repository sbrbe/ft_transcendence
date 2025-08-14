import { FastifyInstance } from "fastify";
import { getUserProfile } from "../lib/getUser.js";

export default async function getUserRoute(app: FastifyInstance) {
	app.get('/getUser/:user_id', {
		schema: {
			description: 'Get user profile',
			params: {
				type: 'object',
				required: ['user_id'],
				properties: {
					user_id: { type: 'string', format: 'uuid'}
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['last_name', 'first_name', 'username', 'avatar_url'],
					properties: {
						last_name: { type: 'string' },
						first_name: { type: 'string' },
						username: { type: 'string' },
						avatar_url: { type: 'string' }
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