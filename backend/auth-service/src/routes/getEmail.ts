import { FastifyInstance } from "fastify";
import { getEmail } from '../lib/getEmail.js';

export default async function getEmailRoute(app: FastifyInstance) {
	app.get<{
		Params: { userId: string };
		Reply: 
			| { email: string; userId: string }
			| { error: string };}>
		('/getEmail/:userId', {
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
					required: ['email', 'userId'],
					properties: {
						email: { type: 'string', format: 'email' },
						userId: { type: 'string', format: 'uuid' }
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
	}, getEmail);
}