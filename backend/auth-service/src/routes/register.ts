import { FastifyInstance } from "fastify";
import { register } from "../lib/register.js";

export default async function registerRoute(app: FastifyInstance) {
	app.post('/register', {
		schema: {
			body: {
				type: 'object',
				required: ['email', 'password'],
				properties: {
					email: { type: 'string', format: 'email' },
					password: { type: 'string', minLength: 8}
				}
			},
			response: {
				201: {
					type: 'object',
					required: ['userId'],
					properties: {
						userId: { type: 'string', format: 'uuid' }
					}
				},
				400: {
					type: 'object',
					properties: {
						error: { type: 'string' }
					}
				}
			},
		}
	}, register);
}