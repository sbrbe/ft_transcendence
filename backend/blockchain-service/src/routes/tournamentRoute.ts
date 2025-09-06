import { postTournamentSummary } from "../lib/tournamentHandler.js";
import type { InternalRoute } from '../internal.js';
import { addPlayers, sendTournamentSummary, TSSummary } from "../lib/tournamentChain.js";
import { saveValues } from "../init_db.js";


export const postTournamentSummaryRoute: InternalRoute = {
  method: 'PUT',
  url: 'tournaments/summary',
  opts: {
    schema: {
      body: {
        type: "object",
        required: [ "tournamentId", "userId", "winnerName", "matches" ],
        properties: {
          tournamentId: { type: "string", format: 'uuid' },
          userId: { type: "string", format: 'uuid' },
          winnerName: { type: "string", minLength: 1, maxLength: 20 },
          matches: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: [ "player1", "player2" ],
              properties: {
                player1: {
                  type: "object",
                  required: [ "name", "score" ],
                  properties: {
                    name: { type: "string", minLength: 1, maxLength: 20 }, score: { type: "number" }
                  }
                },
                player2: {
                  type: "object",
                  required: [ "name", "score" ],
                  properties: {
                    name: { type: "string", minLength: 1, maxLength: 20 }, score: { type: "number" }
                  }
                }
              }
            }
          }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            tournamentId: { type: "string", format: 'uuid' },
            userId: {type: "string", format: 'uuid'},
            txHash: { type: "string" },
            blockNumber: { type: "number" },
            snowtraceTx: { type: "string" }
          }
        }
      }
    }
  }, handler: async (req, reply) => {
    try
      {
        const summary = req.body as TSSummary;
        const r = await sendTournamentSummary(summary);
        const players = addPlayers(summary.matches);
    
        saveValues({ tournamentId: summary.tournamentId, userId: summary.userId, snowtrace_link: r.snowtraceTx, players: players });
    
        return (reply.status(200).send({
          ok: true,
          tournamentId: summary.tournamentId,
          userId: summary.userId,
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
  },
}



