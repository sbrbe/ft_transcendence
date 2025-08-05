import { FastifyInstance } from "fastify";
import { register, deleteUser, login } from './auth.controller.js'

export default async function (app: FastifyInstance) {
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
						userId: { type: 'string' }
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

	app.delete('/:user_id', deleteUser);

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
					properties: {
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
