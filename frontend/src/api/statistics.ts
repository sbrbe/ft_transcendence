import { refreshOnce } from "./A2F";
import { logout } from "./auth";

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
export async function getMatchHistory(userId: string, retried = false): Promise<MatchHistory> {
	const res = await fetch(`/game/match-history/${encodeURIComponent(userId)}`, {
		method: 'GET',
		credentials: 'include',
		headers: { Accept: 'application/json' },
	});

	if (res.status === 401 && !retried) {
		const ok = await refreshOnce();
		if (ok) {
			return getMatchHistory(userId, true);
		} else {
			await logout();
		}
	}

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || res.statusText);
	}
	return {
		history: data.history,
		wins: data.wins,
		losses: data.losses
	};
}

/**
 * Match history : 
 * 	- Opponent username
 * 	- Score
 * 	- Result
 * 	- Date
 */