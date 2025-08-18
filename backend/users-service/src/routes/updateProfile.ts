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
						lastName: { type: 'string', minLength: 1, maxLength: 20 },
						firstName: { type: 'string', minLength: 1, maxLength: 20 },
						username: { type: 'string', minLength: 1, maxLength: 20 },
						avatarUrl: { type: 'string', minLength: 1, maxLength: 20 },
					},
					anyOf: [
						{ required: ['lastName'] },
						{ required: ['firstName'] },
						{ required: ['username'] },
						{ required: ['avatarUrl'] },
					]
				},
				response: {
					200: {
						type: 'object',
						properties: {
							lastName: { type: 'string', minLength: 1, maxLength: 20 },
							firstName: { type: 'string', minLength: 1, maxLength: 20 },
							username: { type: 'string', minLength: 1, maxLength: 20 },
							avatarUrl: { type: 'string', minLength: 1, maxLength: 20 }
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