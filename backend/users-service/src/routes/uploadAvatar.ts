import type { FastifyInstance ,FastifyPluginAsync } from 'fastify';
import path from 'node:path';
import fs from 'node:fs';
import mime from 'mime-types';
import sharp from 'sharp';
import { v4 as uuidv4} from 'uuid';
import type { MultipartFile } from '@fastify/multipart';
import { db } from '../init_db.js';

export const avatarUploadRoute: FastifyPluginAsync = async (app: FastifyInstance) =>{

	app.post<{
		Reply: 
			| { avatarUrl: string; etag: string }
			| { error: string }}>
			('/users/uploadAvatar/:userId', async (req, reply) => {
		const userId = req.params;

		const parts = req.parts();
		let filePart: MultipartFile | null = null;

		for await (const part of parts) {
			if (part.type === 'file'){
				filePart = part;
				break;
			}
		}

		if (!filePart) {
			return reply.status(400).send({ error: 'No file uploaded' });
		}

		const contentType = filePart.mimetype || '';
		const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
		if (!allowed.includes(contentType)) {
			return reply.status(415).send({ error: 'Unsupported media type' });
		}

		const ext = mime.extension(contentType) || 'png';
		const id = uuidv4();
		const filename= `${id}.${ext}`;
		const tmpPath = path.join(app.avatarsDir, `${id}.tmp`);
		const finalPath = path.join(app.avatarsDir, filename);

		const ws = fs.createWriteStream(tmpPath);
		for await (const chunk of (filePart as any).file) {
			ws.write(chunk);
		}
		ws.end();

		await new Promise<void>((res, rej) => {
			ws.on('finish', () => res());
			ws.on('error', rej);
		});

		try {
			const processedName = `${id}.webp`;
			const processedPath = path.join(app.avatarsDir, processedName);
			await sharp(tmpPath)
			.rotate()
			.resize(512, 512, { fit: 'cover' })
			.toFormat('webp', { quality: 85 })
			.withMetadata({ orientation: undefined })
			.toFile(processedPath);

			fs.rmSync(tmpPath, { force: true });
			if (fs.existsSync(finalPath))
				fs.rmSync(finalPath, { force: true });

			const etag = `"${uuidv4()}"`;
			const avatarPath = `/static/avatars/${processedName}`;
			db.prepare(`UPDATE users SET avatarPath = ?, avatarEtag = ? WHERE userId = ?`)
			.run(avatarPath, etag, userId);

			return reply.status(201).send({
				avatarUrl: avatarPath,
				etag
			});
		} catch (error: any) {
			fs.rmSync(tmpPath, { force: true });
			console.log('Error updated avatar: ', error.message);
			return reply.status(500).send({ error: 'Image processing failed' });
		}
	});
}