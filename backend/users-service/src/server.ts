import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import fs from 'node:fs';
import { db, initDB } from './init_db.js';
import registerAllRoutes from './routes/index.js';
import jwtSetup from './plugins/authPlugin.js';
import multipartsPlugin from './plugins/multiparts.js';
import staticAvatarsPlugin from './plugins/static-avatars.js';
import { registerInternal } from './internal.js';
import { setOnlineStatusRoute } from './routes/setOnlineStatus.js';

const app : FastifyInstance = fastify( {
	logger: true,
	https: {
		key: fs.readFileSync('/run/certs/users-service.key'),
		cert: fs.readFileSync('/run/certs/users-service.crt'),
		ca: fs.readFileSync('/run/certs/ca.crt'),
		requestCert: true,
		rejectUnauthorized: false,
	}
});


if (!process.env.JWT_ACCESS_SECRET || !process.env.COOKIE_SECRET) {
	throw new Error('JWT_ACCESS_SECRET or COOKIE_SECRET not set');
}

await app.register(jwtSetup);
await app.register(multipartsPlugin);
await app.register(staticAvatarsPlugin);

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

registerInternal(app, {
	prefix: '/internal',
	allowedCallers: ['auth-service'],
	routes: [
		setOnlineStatusRoute,
	]
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

export default app;