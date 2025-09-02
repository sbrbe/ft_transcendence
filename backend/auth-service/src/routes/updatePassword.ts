import { FastifyInstance } from "fastify";
import { updatePassword } from "../lib/updatePassword.js";

export default async function updatePasswordRoute(app: FastifyInstance)
{
	app.post<{
		Params: { userId: string };
		Body: { oldPassword: string; newPassword: string };
		Reply:
			| { userId: string }
			| { error: string };}>
		('/password/:userId', {
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
				required: ['oldPassword', 'newPassword'],
				properties: {
					oldPassword: { type: 'string', minLength: 8, maxLength: 20 },
					newPassword: { type: 'string', minLength: 8, maxLength: 20 }
				}
			},
			response: {
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