import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import path from 'node:path';
import fs from 'node:fs';
import mime from 'mime-types';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import type { MultipartFile } from '@fastify/multipart';
import { db } from '../init_db.js';

export const avatarUploadRoute: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post<{
    Params: { userId: string };
    Reply: { avatarUrl: string; etag: string } | { error: string };
  }>('/uploadAvatar/:userId', { preHandler: app.authenticate }, async (req, reply) => {
    const { userId } = req.params;

    // Autorisation: le user authentifié doit correspondre au paramètre
    const auth = await req.accessJwtVerify<{ sub: string }>();
    if (!auth || auth.sub !== userId) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    // Récupère la première part "file"
    const parts = req.parts();
    let filePart: MultipartFile | null = null;
    for await (const part of parts) {
      if (part.type === 'file') { filePart = part; break; }
    }
    if (!filePart) return reply.status(400).send({ error: 'No file uploaded' });

    // MIME autorisés
    const contentType = filePart.mimetype || '';
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(contentType)) {
      return reply.status(415).send({ error: 'Unsupported media type' });
    }

    // Dossier par utilisateur
    const userDir = path.join(app.avatarsDir, userId);
    fs.mkdirSync(userDir, { recursive: true });

    const id = uuidv4();
    const tmpPath = path.join(userDir, `${id}.tmp`);
    const ws = fs.createWriteStream(tmpPath);
    for await (const chunk of (filePart as any).file) ws.write(chunk);
    ws.end();
    await new Promise<void>((res, rej) => { ws.on('finish', res); ws.on('error', rej); });

    try {
      // Fichier final .webp (nom horodaté + uuid)
      const processedName = `${Date.now()}-${id}.webp`;
      const processedPath = path.join(userDir, processedName);

      await sharp(tmpPath)
        .rotate()
        .resize(512, 512, { fit: 'cover' })
        .toFormat('webp', { quality: 85 })
        .withMetadata({ orientation: undefined })
        .toFile(processedPath);

      fs.rmSync(tmpPath, { force: true });

      const etag = `"${uuidv4()}"`;
      const avatarUrl = `/static/avatars/${userId}/${processedName}`;

      db.prepare(`UPDATE users SET avatarPath = ?, avatarEtag = ? WHERE userId = ?`)
        .run(avatarUrl, etag, userId);

      return reply.status(201).send({ avatarUrl, etag });
    } catch (error: any) {
      fs.rmSync(tmpPath, { force: true });
      req.log.error({ err: error }, 'Error processing avatar');
      return reply.status(500).send({ error: 'Image processing failed' });
    }
  });
};
