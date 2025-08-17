import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import fs from 'node:fs';
import { db, initDB } from './init_db.js';
import registerAllRoutes from './routes/index.js';
//import fastifyJwt from '@fastify/jwt';
//import cookie from '@fastify/cookie';

const app : FastifyInstance = fastify( {
  logger: true,
  https: {
    key: fs.readFileSync('/run/certs/server.key'),
    cert: fs.readFileSync('/run/certs/server.crt')
  }
});

initDB();

console.log('DB ready?', Boolean(db));
app.decorate('db', db);

/*app.register(cookie , {
   secret: process.env.COOKIE_SECRET,
  });

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET!,
  sign: { algorithm: 'HS256' },
  cookie: { cookieName: 'accessToken', signed: false }
});

app.decorate("authenticate", async function(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' });
  }
});*/

app.register(registerAllRoutes, { prefix: '/auth'});

// 🔎 GET /ma-route
app.get('/auth/ma-route', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = await app.db.prepare('SELECT * FROM auth').all();
    const twoFa = await app.db.prepare('SELECT * FROM two_factor_codes').all();

    return reply.send({ users, twoFa });
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

app.listen({ port: 3002, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`✅ Auth-services running on ${address}`)
});