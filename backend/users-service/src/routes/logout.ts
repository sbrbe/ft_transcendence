import { FastifyInstance } from "fastify";
import { logout } from "../lib/logout.js";

export default async function logoutRoute(app:FastifyInstance) {
	app.post('/logout', {
		schema: {
			description: 'Disconnect user',
			body: {
				type: 'object',
				required: ['user_id'],
				properties: {
					user_id: { type: 'string', format: 'uuid' }
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						message: { type: 'string' }
					}
				},
				400: {
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
	}, logout);	
}