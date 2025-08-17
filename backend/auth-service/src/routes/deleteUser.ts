import { FastifyInstance } from "fastify";
import { deleteUser } from "../lib/deleteUser.js";

export default async function deleteUserRoute(app: FastifyInstance) {
	app.delete('/delete/:userId', {
		schema: {
			description: 'Delete user if register fail',
			params: {
				type: 'object',
				required: ['userId'],
				properties: {
					userId: { type: 'string', format: 'uuid' }
				}
			},
			response: {
				204: {
					description: 'No Content',
					type: 'null'
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
	}, deleteUser);
}