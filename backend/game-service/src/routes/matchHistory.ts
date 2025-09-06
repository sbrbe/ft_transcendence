import { FastifyInstance } from "fastify";
import { getMatchHistory } from "../lib/getMatchHistory.js";

type HistoryItem = {
	id: string;
	winner: string;
	loser: string;
	winnerScore: string;
	loserScore: string;
	totalExchanges: number;
	maxExchanges: number;
	date: string;
	result: 'win' | 'lose';
	opponent: string;
};

type MatchHistory = {
	history: HistoryItem[];
	wins: number;
	losses: number;
};


export default async function getMatchHistoryRoute(app: FastifyInstance) {
	app.get<{
		Params: { userId: string };
		Reply: 
			| { history: MatchHistory }
			| { error: string };}>
		('/match-history/:userId', {
		preHandler: app.authenticate,
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
					required: ['history', 'wins', 'losses'],
					properties: {
						history: {
							type: 'array',
							items: {
								type: 'object',
								required: ['id', 'winner', 'loser', 'winnerScore',
									'loserScore', 'totalExchanges', 'maxExchanges',
									'date', 'result', 'opponent'],
								properties: {
									id: { type: 'string' },
									winner: {type: 'string', format: 'uuid' },
									loser: { type: 'string', format: 'uuid' },
									winnerScore: { type: 'integer' },
									loserScore: { type: 'integer' },
									totalExchanges: { type: 'integer' },
									maxExchanges: { type: 'integer' },
									date: { type: 'string', format: 'date' },
									result: { type: 'string', enum: ['win', 'lose'] },
									opponent: { type: 'string' }
								}
							}
						},
						wins: { type: 'integer' },
						losses: { type: 'integer' }
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
			},
		}
	}, getMatchHistory)
}