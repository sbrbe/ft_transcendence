import { FastifyInstance } from "fastify";
import { login } from '../auth.controller.js';

export default async function loginRoute(app: FastifyInstance)
{
	app.post('/login', {
		schema: {
			body: {
				type: 'object',
				required: ['email', 'password'],
				properties: {
					email: { type: 'string', format: 'email'},
					password: { type: 'string', minLength: 8}
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['user_id', 'message'],
					properties: {
						user_id: { type: 'string', format: 'uuid'},
						message: { type: 'string'}
					}
				},
				400: {
					type: 'object',
					properties: {
						error: { type: 'string' }
					}
				},
				404: {
					type: 'object',
					properties: {
						error: { type: 'string' }
					}
				}
			},
		}
	}, login);
}
