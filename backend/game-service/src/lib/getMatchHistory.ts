import { FastifyReply, FastifyRequest } from 'fastify';
import { SaveMatchInput, db } from '../init_db.js';

export async function getMatchHistory(
	req: FastifyRequest<{ Params: { userId: string }}>,
	reply:FastifyReply) {
		const { userId } = req.params;
		try {
			const matches = getMatches(userId);
			if (!matches) {
				return reply.status(400).send({ error: 'History not found' });
			}
			const history = matches.map(m => ({
				...m,
				result: m.winner === userId ? 'win' : 'lose',
				opponent: m.winner === userId ? m.loserName : m.winnerName,
			}));
			const { wins, losses } = getWinLossCounts(userId);
			return reply.status(200).send({ history, wins, losses });
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
	}

export function getMatches(userId: string): SaveMatchInput[] {
	const stmt = db.prepare(`
		SELECT * FROM matches
		WHERE winner = ? OR loser = ?
		ORDER by date DESC
		`);
	const matches = stmt.all(userId, userId) as SaveMatchInput[];
	return matches;
}

function getWinLossCounts(userId: string) {
	const stmt = db.prepare(`
		SELECT
			COALESCE(SUM(CASE WHEN winner = ? THEN 1 ELSE 0 END), 0) AS wins,
			COALESCE(SUM(CASE WHEN loser = ? THEN 1 ELSE 0 END), 0) AS losses
		FROM matches
		`);
	const res = stmt.get (userId, userId) as { wins: number; losses: number};
	return res;
}