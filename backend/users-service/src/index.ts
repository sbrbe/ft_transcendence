import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import db from './init_db.js';
import usersRoutes from './users.routes.js';

const app : FastifyInstance = fastify( { logger: false });

console.log('DB ready?', Boolean(db));

app.decorate('db', db);

app.listen({ port: 3001, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`✅ Users-services running on ${address}`)
});

app.register(usersRoutes, { prefix: '/users'});

// 🔎 GET /ma-route
app.get('/ma-route', async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const users = await app.db.prepare('SELECT * FROM users').all();
		const friendships = await app.db.prepare('SELECT * FROM friendships').all();
//  	const matches = await db?.prepare('SELECT * FROM matches').all();

		return reply.send({ users, friendships});
	} catch (err: any) {
		return reply.status(500).send({ error: err.message });
	}
});

app.get('/ping', async () => {
    return { message: 'user-profile-service pong' };
  });