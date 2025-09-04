import { FastifyReply, FastifyRequest } from "fastify";
import { sendTournamentSummary, TSSummary } from "./tournamentChain.js";
import { saveValues } from "../init_db.js";

export async function postTournamentSummary( req: FastifyRequest<{ Body: TSSummary }>, reply: FastifyReply)
{
  try
  {
    const summary = req.body;
    const r = await sendTournamentSummary(summary);

    saveValues({ tournoiId: Number(summary.tournamentId),snowtrace_link: r.snowtraceTx });

    return (reply.status(200).send({
      ok: true,
      tournamentId: summary.tournamentId,
      txHash: r.txHash,
      blockNumber: r.blockNumber,
      snowtraceTx: r.snowtraceTx
    }));
  }
  catch (e:any)
  {
    req.log.error({ err: e }, "recordTournamentSummary failed");
    return (reply.status(500).send({error: "Blockchain write failed",details: e?.message ?? "unknown"}));
  }
}
