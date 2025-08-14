import { FastifyInstance } from "fastify";
import { updatePassword } from "../lib/updatePassword.js";

export default async function updatePasswordRoute(app: FastifyInstance)
{
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
}