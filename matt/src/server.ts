import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import postTournamentSummaryRoute from "./tournamentRoute.js";
import { initDB, getValues, db } from "./dataBase.js";

const app : FastifyInstance = fastify({logger: true,});

if(!db)
  initDB();

app.get('/db', async (req, reply) => {
  const rows = getValues();
  return (rows); // Fastify renvoie ça en JSON automatiquement
});

async function start()
{
  try
  {
    await app.register(postTournamentSummaryRoute);
    await app.listen({port: 3004, host: "0.0.0.0"});
    console.log("server running at http://localhost:3004");
  }
  catch (err)
  {
    app.log.error(err);
    process.exit(1);
  }
}

start();
