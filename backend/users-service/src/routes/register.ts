import { FastifyInstance } from "fastify";
import { register } from "../lib/register.js";

export default async function registerRoute(app:FastifyInstance){
	app.post('/register', {
			schema: {
				description: 'Creating user profile',
				body: {
					type: 'object',
					required: ['userId', 'username', 'lastName', 'firstName'],
					properties: {
						userId: { type: 'string', format: 'uuid' },
						username: { type: 'string' },
						lastName: { type: 'string' },
						firstName: { type: 'string' },
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