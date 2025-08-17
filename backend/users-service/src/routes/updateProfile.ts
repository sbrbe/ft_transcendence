import { FastifyInstance } from "fastify";
import { updateProfile } from "../lib/updateProfile.js";

export default async function updateProfileRoute(app: FastifyInstance) {
	app.put('/:userId', {
			schema: {
				description: 'Updating user profile',
				params: {
					type: 'object',
					required: ['userId'],
					properties: {
						userId: { type: 'string', format: 'uuid'}
					}
				},
				body: {
					type: 'object',
					properties: {
						userId: { type: 'string', format: 'uuid' },
						lastName: { type: 'string' },
						firstName: { type: 'string' },
						username: { type: 'string' },
						avatarUrl: { type: 'string' },
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
							lastName: { type: 'string' },
							firstName: { type: 'string' },
							username: { type: 'string' },
							avatarUrl: { type: 'string' }
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