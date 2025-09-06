import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import postTournamentSummaryRoute from "./routes/tournamentRoute.js";
import { initDB, getValues, db } from "./init_db.js";
import fs from 'node:fs';
import jwtSetup from './plugins/authPlugin.js';
import { tournoiValues } from "./types/fastify.js";

const app : FastifyInstance = fastify( {
	logger: true,
	https: {
		key: fs.readFileSync('/run/certs/blockchain-service.key'),
		cert: fs.readFileSync('/run/certs/blockchain-service.crt'),
		ca: fs.readFileSync('/run/certs/ca.crt'),
		requestCert: true,
		rejectUnauthorized: false,
	}
});

if (!process.env.JWT_ACCESS_SECRET || !process.env.COOKIE_SECRET) {
	throw new Error('JWT_ACCESS_SECRET or COOKIE_SECRET not set');
}

await app.register(jwtSetup);

initDB();

await app.register(postTournamentSummaryRoute);

app.get('/blockchain/ma-route', async (request: FastifyRequest<{Body: tournoiValues }>, reply: FastifyReply) => {
	try {
		const {userId} = request.body;
		const rows = getValues(userId);
		return reply.send({ rows });
	} catch (err: any) {
		return reply.status(500).send({ error: err.message });
	}
});

app.get('/blockchain/db', async (request: FastifyRequest<{Body: tournoiValues }>, reply: FastifyReply) => {
	try {
		const {userId} = request.body;
		const rows = getValues(userId);
		return reply.status(200).send({ rows });
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

await app.ready();
 
app.listen({ port: 3003, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`✅ Blockchain-service running on ${address}`)
});

export default app;