import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import fs from 'node:fs';
import jwtSetup from './plugins/authPlugin.js';
import { initDB, db } from './init_db.js';
import { attachWs } from './wssServer.js';
import getMatchHistoryRoute from './routes/matchHistory.js';

const app : FastifyInstance = fastify( {
	logger: true,
	https: {
		key: fs.readFileSync('/run/certs/game-service.key'),
		cert: fs.readFileSync('/run/certs/game-service.crt'),
		ca: fs.readFileSync('/run/certs/ca.crt'),
//		requestCert: true,
		rejectUnauthorized: false,
	}
});

if (!process.env.JWT_ACCESS_SECRET || !process.env.COOKIE_SECRET) {
	throw new Error('JWT_ACCESS_SECRET or COOKIE_SECRET not set');
}

await app.register(jwtSetup);

initDB();

app.register(getMatchHistoryRoute, { prefix: '/game'})

app.get('/game/ma-route', async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const matches = await db.prepare('SELECT * FROM matches').all();
		return reply.send({ matches });
	} catch (err: any) {
		return reply.status(500).send({ error: err.message });
	}
});

app.get('/game/ping', async () => {
	return { message: 'game-service pong' };
});

app.get('/game/health', async (req, reply) => {
	return reply.status(200).send({ status: 'ok' });
});

/*
app.get('/game/match', async () => {
  const rows = getAllMatches();
  return rows;
});
*/
/*
registerInternal(app, {
	prefix: '/internal',
	allowedCallers: ['auth-service'],
	routes: [
		setOnlineStatusRoute,
	]
});
*/

attachWs(app);
await app.ready();

app.listen({ port: 3004, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`✅ Game-services running on ${address}`)
});

export default app;