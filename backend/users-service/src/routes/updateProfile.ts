import { FastifyInstance } from "fastify";
import { updateProfile } from "../lib/updateProfile.js";

export default async function updateProfileRoute(app: FastifyInstance) {
	app.put('/:user_id', {
			schema: {
				description: 'Updating user profile',
				params: {
					type: 'object',
					required: ['user_id'],
					properties: {
						user_id: { type: 'string', format: 'uuid'}
					}
				},
				body: {
					type: 'object',
					properties: {
						user_id: { type: 'string', format: 'uuid' },
						last_name: { type: 'string' },
						first_name: { type: 'string' },
						username: { type: 'string' },
						avatar_url: { type: 'string' },
					},
					anyOf: [
						{ required: ['last_name'] },
						{ required: ['first_name'] },
						{ required: ['username'] },
						{ required: ['avatar_url'] },
					]
				},
				response: {
					200: {
						type: 'object',
						properties: {
							last_name: { type: 'string' },
							first_name: { type: 'string' },
							username: { type: 'string' },
							avatar_url: { type: 'string' }
						}
					},
					400: {
						type: 'object',
						properties: {
							error: { type: 'string' },
						}
					},
					404: {
						type: 'object',
						properties: {
							error: { type: 'string' },
						}
					}
				},
	
			}
		}, updateProfile);
}