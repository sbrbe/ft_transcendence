import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import path from 'node:path';
import fsp from 'node:fs/promises';

export const listAvatarsRoute: FastifyPluginAsync = async (app: FastifyInstance) => {
	app.get<{ 
		Params: { userId: string }}>
		('/avatars/:userId', { preHandler: app.authenticate,}, async (req, reply) => {
	const { userId } = req.params;
	const dir = path.join(app.avatarsDir, userId);
	await fsp.mkdir(dir, { recursive: true });
	const entries = await fsp.readdir(dir, { withFileTypes: true });
	const stats = await Promise.all(
		entries.filter(e => e.isFile() && e.name.endsWith('.webp'))
			.map(async e => {
			const s = await fsp.stat(path.join(dir, e.name));
			return { name: e.name, mtime: s.mtimeMs };
		})
	);
	stats.sort((a, b) => b.mtime - a.mtime);
	return reply.send({ avatars: stats.map(f => `/static/avatars/${userId}/${f.name}`) });
	});
};
