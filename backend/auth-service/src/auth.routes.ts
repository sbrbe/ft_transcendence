import { FastifyInstance } from "fastify";
import { register, deleteUser, login, updateEmail, getUser, updatePassword } from './auth.controller.js';

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
					required: ['user_id'],
					properties: {
						user_id: { type: 'string', format: 'uuid' }
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

	app.delete('/delete/:user_id', deleteUser);

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

	app.put('/email/:user_id', {
		schema: {
			description: 'Update email',
			params: {
				type: 'object',
				required: ['user_id'],
				properties: {
					user_id: { type: 'string', format: 'uuid' }
				}
			},
			body: {
				type: 'object',
				required: ['email'],
				properties: {
					email: { type: 'string', format: 'email'}
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						user_id: { type: 'string', format: 'uuid' },
						email: { type: 'string', format: 'email' }
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
						error: { type: 'string'}
					}
				}
			},
		}
	}, updateEmail);

	app.post('/password/:user_id', {
		schema: {
			description: 'Update password',
			params: {
				type: 'object',
				required: ['user_id'],
				properties: {
					user_id: { type: 'string', format: 'uuid' }
				}
			},
			body: {
				type: 'object',
				required: ['oldPassword', 'newPassword'],
				properties: {
					oldPassword: { type: 'string', minLength: 8 },
					newPassword: { type: 'string', minLength: 8 }
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						user_id: { type: 'string', format: 'uuid' },
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
						error: { type: 'string'}
					}
				}
			},
		}
	}, updatePassword);
	
	app.get('/getEmail/:user_id', {
		schema: {
			description: 'Get email',
			params: {
				type: 'object',
				required: ['user_id'],
				properties: {
					user_id: { type: 'string', format: 'uuid' }
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['email', 'user_id'],
					properties: {
						email: { type: 'string', format: 'email' },
						user_id: { type: 'string', format: 'uuid' }
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
	}, getUser);
}