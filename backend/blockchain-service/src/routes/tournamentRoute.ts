import { FastifyInstance } from "fastify";
import { postTournamentSummary } from "../lib/tournamentHandler.js";

export default async function postTournamentSummaryRoute(app: FastifyInstance)
{
  app.post("/tournaments/summary", {
    schema: {
      description: "1 tournoi, 1 transaction",
      body: {
        type: "object",
        required: [ "tournamentId", "userId", "winnerName", "matches" ],
        properties: {
          tournamentId: { type: "string" },
          userId: { type: "string" },
          winnerName: { type: "string" },
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
                    name: { type: "string" }, score: { type: "number" }
                  }
                },
                player2: {
                  type: "object",
                  required: [ "name", "score" ],
                  properties: {
                    name: { type: "string" }, score: { type: "number" }
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
            tournamentId: { type: "string" },
            userId: {type: "string"},
            txHash: { type: "string" },
            blockNumber: { type: "number" },
            snowtraceTx: { type: "string" }
          }
        }
      }
    },
    handler: postTournamentSummary
  });
}
