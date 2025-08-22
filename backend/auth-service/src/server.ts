import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import fs from 'node:fs';
import { db, initDB } from './init_db.js';
import registerAllRoutes from './routes/index.js';
import jwtSetup from './plugins.js'

const app : FastifyInstance = fastify( {
	logger: true,
	https: {
		key: fs.readFileSync('/run/certs/server.key'),
		cert: fs.readFileSync('/run/certs/server.crt')
	}
});

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET || !process.env.COOKIE_SECRET) {
	throw new Error('JWT_ACCESS_SECRET, JWT_REFRESH_SECRET or COOKIE_SECRET not set');
}

app.register(jwtSetup);

initDB();
app.decorate('db', db);

const PUBLIC_PATH = new Set<string>([
	'/auth/login', 
	'/auth/refresh', 
	'/auth/register', 
	'/auth/ma-route',
	'/auth/2fa/verify']);

app.addHook('preHandler', async (req: FastifyRequest, reply: FastifyReply) => {
  const url = req.routeOptions.url;
  const method = req.method;
  if (method === 'OPTIONS' || PUBLIC_PATH.has(url!))
    return;
  try {
    await req.accessJwtVerify({ onlyCookie: true });
  } catch (error) {
    return reply.status(401).send({ message: 'Unauthorized' });
  }
});


app.register(registerAllRoutes, { prefix: '/auth'});

// 🔎 GET /ma-route
app.get('/auth/ma-route', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = await app.db.prepare('SELECT * FROM auth').all();
    const twoFa = await app.db.prepare('SELECT * FROM two_factor_codes').all();
	const refreshToken = await app.db.prepare('SELECT * FROM refresh_tokens').all();
    return reply.send({ users, twoFa, refreshToken });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
});

app.get('/auth/ping', async () => {
    return { message: 'auth-service pong' };
  });

app.get('/auth/health', async (_req, reply) => {
  return reply.status(200).send({ status: 'ok' });
});

await app.ready();

app.listen({ port: 3002, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`✅ Auth-services running on ${address}`)
});