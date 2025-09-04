import { FastifyInstance } from "fastify";
import { postTournamentSummary } from "../lib/tournamentHandler.js";

export default async function postTournamentSummaryRoute(app: FastifyInstance)
{
  app.post("/tournaments/summary", {
    schema: {
      description: "1 tournoi, 1 transaction",
      body: {
        type: "object",
        required: ["tournamentId", "winnerName", "matches"],
        properties: {
          tournamentId: { type: "number" },
          winnerName: { type: "string" },
          matches: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["round", "player1", "player2"],
              properties: {
                round: { type: "number", minimum: 0, maximum: 3 },
                player1: {
                  type: "object",
                  required: ["name", "score"],
                  properties: {
                    name: { type: "string" }, score: { type: "number" }
                  }
                },
                player2: {
                  type: "object",
                  required: ["name", "score"],
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
            tournamentId: { type: "number" },
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
