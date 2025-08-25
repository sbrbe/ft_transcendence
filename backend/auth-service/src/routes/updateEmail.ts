import { FastifyInstance } from "fastify";
import { updateEmail } from "../lib/updateEmail.js";


export default async function updateEmailRoute(app: FastifyInstance){
	app.put<{
		Params: { userId: string };
		Body: { email: string };
		Reply:
			| { userId: string; email: string }
			| { error: string };}>
		('/email/:userId', {
		preHandler: app.authenticate,
		schema: {
			params: {
				type: 'object',
				required: ['userId'],
				properties: {
					userId: { type: 'string', format: 'uuid' }
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
						userId: { type: 'string', format: 'uuid' },
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
}