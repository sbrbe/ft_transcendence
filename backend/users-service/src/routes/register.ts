import { FastifyInstance } from "fastify";
import { register } from "../lib/register.js";

export default async function registerRoute(app:FastifyInstance){
	app.post('/register', {
			schema: {
				description: 'Creating user profile',
				body: {
					type: 'object',
					required: ['user_id', 'username', 'last_name', 'first_name'],
					properties: {
						user_id: { type: 'string', format: 'uuid' },
						username: { type: 'string' },
						last_name: { type: 'string' },
						first_name: { type: 'string' },
					}
				},
				response: {
					201: {
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
					}
				},
			}
		}, register);
}