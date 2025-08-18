import { FastifyInstance } from "fastify";
import { loginVerify } from "../lib/login.js";


export default async function loginVerifyRoute(app: FastifyInstance)
{
	app.post('/2fa/verify', {
		schema: {
			body: {
				type: 'object',
				required: ['userId', 'code'],
				properties: {
					userId: { type: 'string', format: 'uuid'},
					code: { type: 'string', minLength: 6}
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['message'],
					properties: {
						message: { type: 'string'}
					}
				},
				401: {
					type: 'object',
					properties: {
						error: { type: 'string' }
					}
				},
			},
		}
	}, loginVerify);
}