import { FastifyInstance } from "fastify";
import { sendFriendRequest, acceptRequest, rejectRequest } from "../lib/friends";

export default async function friendsRequestRoute(app: FastifyInstance) {
	app.post<{
		Body: { userId: string, friendUsername: string };
		Reply: 
			| { message: string }
			| { error: string };}>
			('/friends/request', {
		preHandler: app.authenticate,
		schema: {
			body: {
				type: 'object',
				required: ['userId', 'friendId'],
				properties: {
					userId: { type: 'string', format: 'uuid' },
					friendUsername: { type: 'string', minLength: 1, maxLength: 20 }
				}
			},
			response: {
				201: {
					type: 'object',
					properties: {
						message: { type: 'string' }
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
	}, sendFriendRequest);

	app.put<{
		Body: { userId: string, requestId: number };
		Reply: 
			| { message: string }
			| { error: string };}>
			('/friends/accept', {
		preHandler: app.authenticate,
		schema: {
			body: {
				type: 'object',
				required: ['userId', 'requestId'],
				properties: {
					userId: { type: 'string', format: 'uuid' },
					requestId: { type: 'number', minLength : 1 }
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						message: { type: 'string' }
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
	}, acceptRequest);

	app.put<{
		Body: { userId: string, requestId: number };
		Reply: 
			| { message: string }
			| { error: string };}>
			('/friend/reject', {
		preHandler: app.authenticate,
		schema: {
			body: {
				type: 'object',
				required: ['userId', 'requestId'],
				properties: {
					userId: { type: 'string', format: 'uuid' },
					requestId: { type: 'number', minLength : 1 }
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						message: { type: 'string' }
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
	}, rejectRequest )
}	
