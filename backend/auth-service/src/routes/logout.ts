import { FastifyInstance } from "fastify";
import { logout } from "../lib/logout.js";

export default async function logoutRoute(app:FastifyInstance) {
	app.post<{
		Body: { userId: string };
		Reply:
			| { message: string }
			| { error: string };}>
	('/logout', {
		schema: {
			body: {
				type: 'object',
				required: ['userId'],
				properties: {
					userId: { type: 'string', format: 'uuid' }
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
	},
	logout);	
}