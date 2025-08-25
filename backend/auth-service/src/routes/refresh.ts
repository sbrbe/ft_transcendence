import { FastifyInstance } from "fastify";
import { rotateRefresh } from "../lib/createToken.js";

export default async function refreshRoute(app: FastifyInstance)
{
	app.post('/refresh', {
		schema: {
			response: {
				200: {
					type: 'object',
					required: ['message'],
					properties: {
						message: { message: 'string' }
					}
				},
				401: {
					type: 'object',
					required: ['error'],
					properties: {
						error: { error: 'string' }
					}
				}
			},
		}
	}, rotateRefresh)
}