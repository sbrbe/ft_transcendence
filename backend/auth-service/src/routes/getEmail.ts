import { FastifyInstance } from "fastify";
import { getUser } from '../auth.controller.js';

export default async function getEmailRoute(app: FastifyInstance) {
	app.get('/getEmail/:user_id', {
		schema: {
			description: 'Get email',
			params: {
				type: 'object',
				required: ['user_id'],
				properties: {
					user_id: { type: 'string', format: 'uuid' }
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['email', 'user_id'],
					properties: {
						email: { type: 'string', format: 'email' },
						user_id: { type: 'string', format: 'uuid' }
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
	}, getUser);
}