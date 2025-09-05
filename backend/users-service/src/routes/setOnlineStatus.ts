import type { InternalRoute } from '../internal.js';
import { getUserById } from '../lib/utils.js';
import { db } from '../init_db.js';

export const setOnlineStatusRoute: InternalRoute = {
	method: 'PUT',
	url: '/status',
	opts: {
		schema: {
			body: {
				type: 'object',
				required: ['userId', 'online'],
				properties: {
					userId: { type: 'string' },
					online: { type: 'boolean' }
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['success'],
					properties: {
						success: { type: 'boolean' }
					}
				},
				400: {
					type: 'object',
					required: ['success', 'error'],
					properties: {
						success: { type: 'boolean' },
						error: { type: 'string' }
					}
				}
			}	
		}
	},
	handler: (req, reply) => {
		const { userId, online } = req.body as { userId: string, online: boolean };

		const user = getUserById(userId);
		console.log('SET STATUS = ', online);
		if (!user) {
			return reply.status(400).send({ success: false, error: 'User not found' });
		}
		try {
			const updated = db.prepare(
				`UPDATE users SET isOnline = ? WHERE userId = ?`)
				.run(online ? 1 : 0, userId);
			return reply.status(200).send({ success: true });
		} catch (error: any) {
			return reply.status(400).send({ success: false, error: error.message });
		}
	},
}