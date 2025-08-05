import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import db from './init_db.js';
import authRoutes from './auth.routes.js';

const app : FastifyInstance = fastify( { logger: true });

console.log('DB ready?', Boolean(db));

app.decorate('db', db);

app.listen({ port: 3002, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`✅ Auth-services running on ${address}`)
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
