import { FastifyInstance } from "fastify";
import { register, logout } from './users.constroller.js';

export default async function (app: FastifyInstance) {
	app.post('/register', {
		schema: {
			body: {
				type: 'object',
				required: ['username', 'last_name', 'fist_name', 'display_name'],
				properties: {
					username: { type: 'string' },
					last_name: { type: 'string' },
					first_name: { type: 'string' },
					display_name: { type: 'string' }
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

	app.post('/logout', {
		schema: {
			body: {
				type: 'object',
				required: ['userId'],
				properties: {
					userId: { type: 'string' }
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