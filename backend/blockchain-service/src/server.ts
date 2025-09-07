import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import postTournamentSummaryRoute from "./routes/tournamentRoute.js";
import { initDB, db } from "./init_db.js";
import getTournament from "./routes/getTournamentHistory.js";
import fs from 'node:fs';
import jwtSetup from './plugins/authPlugin.js';

const app : FastifyInstance = fastify( {
	logger: true,
	https: {
		key: fs.readFileSync('/run/certs/blockchain-service.key'),
		cert: fs.readFileSync('/run/certs/blockchain-service.crt'),
		ca: fs.readFileSync('/run/certs/ca.crt'),
	//	requestCert: true,
		rejectUnauthorized: false,
	}
});

if (!process.env.JWT_ACCESS_SECRET || !process.env.COOKIE_SECRET) {
	throw new Error('JWT_ACCESS_SECRET or COOKIE_SECRET not set');
}

await app.register(jwtSetup);

initDB();

await app.register(postTournamentSummaryRoute);
await app.register(getTournament);

app.get('/blockchain/ma-route', async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const rows = await db.prepare('SELECT * FROM tournaments').all();
		return reply.send({ rows });
	} catch (err: any) {
		return reply.status(500).send({ error: err.message });
	}
});

app.get('/blockchain/ping', async () => {
    return { message: 'blockchain-service pong' };
  });

app.get('/users/health', async (req, reply) => {
	return reply.status(200).send({ status: 'ok' });
});

// app.get('/blockchain/ma-route', async (request: FastifyRequest, reply: FastifyReply) => {
// 	try {
// 		const rows = getValues("rot13");
// 		return reply.send({ rows });
// 	} catch (err: any) {
// 		return reply.status(500).send({ error: err.message });
// 	}
// });



// registerInternal(app, {
// 	prefix: '/internal',
// 	allowedCallers: ['game-service'],
// 	routes: [
// 		postTournamentSummaryRoute,
// 	]
// });


await app.ready();
 
app.listen({ port: 3003, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`✅ Blockchain-service running on ${address}`)
});

export default app;