import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import fs from 'node:fs';
import { db, initDB } from './init_db.js';
import registerAllRoutes from './routes/index.js';
import jwtSetup from './authPlugin.js'

const app : FastifyInstance = fastify( {
	logger: true,
	https: {
		key: fs.readFileSync('/run/certs/server.key'),
		cert: fs.readFileSync('/run/certs/server.crt')
	}
});

if (!process.env.JWT_ACCESS_SECRET || !process.env.COOKIE_SECRET) {
	throw new Error('JWT_ACCESS_SECRET or COOKIE_SECRET not set');
}

app.register(jwtSetup);

console.log('DB ready?', Boolean(db));
//console.log('typeof usersRoutes =', typeof registerAllRoutes); // doit afficher "function"

initDB();
app.decorate('db', db);

app.register(registerAllRoutes, { prefix: '/users'});

// 🔎 GET /ma-route
app.get('/users/ma-route', async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const users = await app.db.prepare('SELECT * FROM users').all();
		const friendships = await app.db.prepare('SELECT * FROM friendships').all();

		return reply.send({ users, friendships});
	} catch (err: any) {
		return reply.status(500).send({ error: err.message });
	}
});

app.get('/users/ping', async () => {
    return { message: 'user-profile-service pong' };
  });

app.get('/users/health', async (_req, reply) => {
	return reply.status(200).send({ status: 'ok' });
  });

await app.ready();
//console.log('ROUTES = ', app.printRoutes()); // <- DOIT afficher "POST /users/logout"


app.listen({ port: 3001, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`✅ Users-services running on ${address}`)
});