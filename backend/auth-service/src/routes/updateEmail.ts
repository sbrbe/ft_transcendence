import { FastifyInstance } from "fastify";
import { updateEmail } from "../lib/updateEmail.js";


export default async function updateEmailRoute(app: FastifyInstance){
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
}