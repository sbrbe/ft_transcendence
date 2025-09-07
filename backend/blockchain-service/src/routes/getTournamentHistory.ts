import { FastifyInstance } from "fastify";
import { db } from "../init_db.js";

type Row = {
	tournamentId: string;
	snowtraceLink: string;
	players: string;
	userId: string;
	date: string;
};

type TournamentItem = {
	tournamentId: string;
	snowtraceLink: string;
	players: string[];
	date: string;
};

type TournamentHistory = {
	history: TournamentItem[];
};



export default async function getTournament(app: FastifyInstance) {
	app.get('/blockchain/tournament-history/:userId', {
		schema: {
			params: {
				type: 'object',
				required: ['userId'],
				properties: {
					userId: { type: 'string', format: 'uuid' }
				}
			},
			response: {
				200: {
					type: 'object',
					required: ['history'],
					properties: {
						history: { 
							type : 'array',
							items: {
								type: 'object',
								required: ['tournamentId', 'snowtraceLink', 'players', 'date'],
								properties: {
									tournamentId: { type: 'string', format: 'uuid' },
									snowtraceLink: { type: 'string' },
									players: {
										type: 'array',
										minItems: 1,
										items: { type: 'string', minLength: 1, maxLength: 20 }
									},
									date: { type: 'string' }
								}
							}
						}
					}
				},
				400: {
					type: 'object',
					required: ['error'],
					properties: {
						error: { type: 'string' }
					}
				},
				500: {
					type: 'object',
					required: ['error'],
					properties: {
						error: { type: 'string' }
					}
				}
			}
		}
	},
	async (req, reply) => {
		try {
			const { userId } = req.params as { userId: string };
			const history = getTournamentHistory(userId);
			if (!history) {
				return reply.status(400).send({ error: 'Tournament history not found' });
			}
			console.log('HISTORY: ', history);
			console.log('PLAYERS: ', history)
			return reply.status(200).send(history)
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
	} )
}

function getTournamentHistory(userId: string): TournamentHistory {
	const rows = db.prepare(`
		SELECT tournamentId, userId, snowtraceLink, players, date
		FROM tournaments
		WHERE userId = ?
		ORDER BY rowid DESC
		`).all(userId) as Row[];
	console.log('ROWS: ', rows);
	const history: TournamentItem[] = rows.map((r) => ({
		tournamentId: r.tournamentId,
		snowtraceLink: r.snowtraceLink,
		players: safeParsePlayers(r.players),
		date: r.date
	}));
	return { history };
}

function safeParsePlayers(json: string): string[] {
  try
  {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  }
  catch
  {
    return [];
  }
}