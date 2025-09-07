import fp from 'fastify-plugin';
import staticPlugin from '@fastify/static';
import path from 'node:path';
import fs from 'node:fs';

export default fp(async (app) => {
	const avatarsDir = path.join(process.cwd(), 'static', 'avatars');
	fs.mkdirSync(avatarsDir, { recursive: true });

	await app.register(staticPlugin, {
		root: avatarsDir,
		prefix: '/static/avatars/',
		index: false,
		decorateReply: false,
	});

	app.decorate('avatarsDir', avatarsDir);
});
