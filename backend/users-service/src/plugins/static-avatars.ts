import fp from 'fastify-plugin';
import staticPlugin from '@fastify/static';
import path from 'node:path';
import fs from 'node:fs';

export default fp(async (app) => {
	const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
	fs.mkdirSync(uploadDir, { recursive: true });
		
	await app.register(staticPlugin, {
		root: uploadDir,
		prefix: '/static/avatars',
		index: false,
		decorateReply: false
	});
	app.decorate('avatarDir', uploadDir);
});
