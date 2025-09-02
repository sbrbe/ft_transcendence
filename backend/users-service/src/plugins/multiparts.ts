import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';

export default fp(async (app) => {
	await app.register(multipart, {
		attachFieldsToBody: false,
		limits: {
			fileSize: 5 * 1024 * 1024,
			files: 1
		}
	});
});