import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import db from './init_db.js';
import authRoutes from './auth.routes.js';
import fastifyJwt from '@fastify/jwt';
import cookie from '@fastify/cookie';

const app : FastifyInstance = fastify( { logger: true });

console.log('DB ready?', Boolean(db));
app.decorate('db', db);

app.register(cookie /*, { secret: process.env.COOKIE_SIGNING_SECRET }*/);

app.register(fastifyJwt, {
  secret: process.env.INTERNAL_JWT_SECRET!,
  sign: { algorithm: 'HS256', iss: 'auth-service', aud: 'users-service' },
  verify: { allowedIss: 'auth-service', allowedAud: 'users-service'},
  cookie: { cookieName: 'accessToken' }
});

app.decorate("authenticate", async function(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' });
  }
});

app.register(authRoutes, { prefix: '/auth'});

// 🔎 GET /ma-route
app.get('/ma-route', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = await app.db.prepare('SELECT * FROM auth').all();

    return reply.send({ users });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
});

app.get('/ping', async () => {
    return { message: 'auth-service pong' };
  });

app.listen({ port: 3002, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`✅ Auth-services running on ${address}`)
});