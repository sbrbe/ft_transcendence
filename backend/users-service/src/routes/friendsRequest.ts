import { FastifyInstance } from "fastify";
import { sendFriendRequest, acceptRequest, rejectRequest, getPendingRequest, FriendsRequest, getFriendsList, removeFriend } from "../lib/friends.js";

export default async function friendsRequestRoute(app: FastifyInstance) {
	app.post<{
		Body: { userId: string, friendUsername: string };
		Reply: 
			| { message: string }
			| { error: string };}>
			('/friends/invite', {
		preHandler: app.authenticate,
		schema: {
			body: {
				type: 'object',
				required: ['userId', 'friendUsername'],
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
					requestId: { type: 'number' }
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
			('/friends/reject', {
		preHandler: app.authenticate,
		schema: {
			body: {
				type: 'object',
				required: ['userId', 'requestId'],
				properties: {
					userId: { type: 'string', format: 'uuid' },
					requestId: { type: 'number' }
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
	}, rejectRequest);


	app.put<{
			Body: { userId: string, friendUsername: string };
			Reply:
				| { messsage: string }
				| { error: string };}>
				('/friends/remove', {
			preHandler: app.authenticate,
			schema: {
				body: {
					type: 'object',
					required: ['userId', 'friendUsername'],
					properties: {
						userId: { type: 'string', format: 'uuid' },
						friendUsername: { type: 'string', minLength: 1, maxLength: 20 }
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
		}, removeFriend);

	app.get<{
		Params: { userId: string };
		Reply: 
			| FriendsRequest[]
			| { error: string };}>
			('/friends/request-pending/:userId', {
		preHandler: app.authenticate,
		schema: {
			params: {
				type: 'object',
				required: ['userId'],
				properties: {
					userId: { type: 'string', format: 'uuid' }
				}
			},
			response: {
				200: {
					type: 'array',
					items: {
						type: 'object',
						required: ['id', 'friendId', 'friendUsername', 'friendAvatarPath'],
						properties: {
							id: { type: 'string' },
							friendId: { type: 'string', format: 'uuid' },
							friendUsername: { type: 'string' },
							friendAvatarPath: { type: 'string' }
						}
					}
				},
				500: {
					type: 'object',
					required: ['error'],
					properties: {
						error: { type: 'string' }
					}
				}
			},
		},
	}, getPendingRequest);

	app.get<{
		Params: { userId: string };
		Reply: 
			| FriendsRequest[]
			| { error: string };}>
			('/friends/my-friends/:userId', {
		preHandler: app.authenticate,
		schema: {
			params: {
				type: 'object',
				required: ['userId'],
				properties: {
					userId: { type: 'string', format: 'uuid' }
				}
			},
			response: {
				200: {
					type: 'array',
					items: {
						type: 'object',
						required: ['id', 'friendId', 'friendUsername', 'friendAvatarPath', 'isOnline'],
						properties: {
							id: { type: 'string' },
							friendId: { type: 'string', format: 'uuid' },
							friendUsername: { type: 'string' },
							friendAvatarPath: { type: 'string' },
							isOnline: { type: 'boolean' }
						}
					}
				},
				500: {
					type: 'object',
					required: ['error'],
					properties: {
						error: { type: 'string' }
					}
				}
			},
		},
	}, getFriendsList);

}	