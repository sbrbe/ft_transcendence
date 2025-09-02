import { FastifyInstance } from "fastify";
import { blockUser, removeFriend, unblockUser } from "../lib/friends";

export default async function friendsUtilsRoute(app: FastifyInstance) {
	app.post<{
		Body: { userId: string, targetName: string };
		Reply:
			| { message: string }
			| { error: string };}>
			('/friends/block', {
		preHandler: app.authenticate,
		schema: {
			body: {
				type: 'object',
				required: ['userId', 'targetName'],
				properties: {
					userId: { type: 'string', format: 'uuid' },
					targetName: { type: 'string', minLength: 1, maxLength: 20 }
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['message'],
					properties: {
						message: { type: 'string ' }
					}
				},
				404: {
					type: 'object',
					required: ['error'],
					properties: {
						error: { type: 'string' }
					}
				},
				500: {
					type: 'object',
					required: ['error'],
					properties: {
						error: { type: 'string' }
					}
				}
			}
		},
	}, blockUser)

	app.put<{
		Body: { userId: string, targetName: string };
		Reply:
			| { message: string }
			| { error: string };}>
			('/friends/unblock', {
		preHandler: app.authenticate,
		schema: {
			body: {
				type: 'object',
				required: ['userId', 'targetName'],
				properties: {
					userId: { type: 'string', format: 'uuid' },
					targetName: { type: 'string', minLength: 1, maxLength: 20 }
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['message'],
					properties: {
						message: { type: 'string' }
					}
				},
				400: {
					type: 'object',
					required: ['error'],
					properties: {
						error: { type: 'string' }
					}
				},
				404: {
					type: 'object',
					required: ['error'],
					properties: {
						error: { type: 'string' }
					}
				},
				500: {
					type: 'object',
					required: ['error'],
					properties: {
						error: { type: 'string' }
					}
				}
			}
		},
	}, unblockUser)

	app.put<{
		Body: { userId: string, targetName: string };
		Reply:
			| { messsage: string }
			| { error: string };}>
			('/friends/remove', {
		preHandler: app.authenticate,
		schema: {
			body: {
				type: 'object',
				required: ['userId', 'targetName'],
				properties: {
					userId: { type: 'string', format: 'uuid' },
					targetName: { type: 'string', minLength: 1, maxLength: 20 }
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['message'],
					properties: {
						message: { type: 'string' }
					}
				},
				404: {
					type: 'object',
					required: ['error'],
					properties: {
						error: { type: 'string' }
					}
				},
				500: {
					type: 'object',
					required: ['error'],
					properties: {
						error: { type: 'string' }
					}
				}
			}
		},
	}, removeFriend)
}
