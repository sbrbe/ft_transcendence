import { FastifyInstance } from "fastify";
import { register, logout, updateProfile, getUserProfile } from './users.controller.js';

console.log('✅ users.routes chargé');

export default async function (app: FastifyInstance) {
	console.log('🚚 users.routes plugin EXECUTED');
	app.post('/register', {
		schema: {
			description: 'Creating user profile',
			body: {
				type: 'object',
				required: ['user_id', 'username', 'last_name', 'first_name', 'display_name'],
				properties: {
					user_id: { type: 'string', format: 'uuid' },
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
			description: 'Disconnect user',
			body: {
				type: 'object',
				required: ['user_id'],
				properties: {
					user_id: { type: 'string', format: 'uuid' }
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
					display_name: { type: 'string' },
					avatar_url: { type: 'string' },
				},
				anyOf: [
					{ required: ['last_name'] },
					{ required: ['first_name'] },
					{ required: ['username'] },
					{ required: ['display_name'] },
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
						display_name: { type: 'string' },
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

	app.get('/getUser/:user_id', {
		schema: {
			description: 'Get user profile',
			params: {
				type: 'object',
				required: ['user_id'],
				properties: {
					user_id: { type: 'string', format: 'uuid'}
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['last_name', 'first_name', 'username', 'display_name', 'avatar_url'],
					properties: {
						last_name: { type: 'string' },
						first_name: { type: 'string' },
						username: { type: 'string' },
						display_name: { type: 'string' },
						avatar_url: { type: 'string' }
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
	}, getUserProfile);
}