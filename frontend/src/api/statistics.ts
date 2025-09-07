import { refreshOnce } from "./A2F";
import { logout } from "./auth";

type HistoryItem = {
	id: string;
	winner: string;
	loser: string;
	winnerName: string;
	loserName: string;
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

type TournamentItem = {
	tournmanentId: string;
	snowtraceLink: number;
	players: string[];
};

type TournamentHistory = {
	history: TournamentItem[];
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

export async function getTournaments(userId: string, retried = false): Promise<TournamentHistory> {
	const res = await fetch(`/blockchain/tournament-history/${encodeURIComponent(userId)}`, {
		method: 'GET',
		credentials: 'include',
		headers: { Accept: 'application/json' },
	});

	if (res.status === 401 && !retried) {
		const ok = await refreshOnce();
		if (ok) {
			return getTournaments(userId, true);
		} else {
			await logout();
		}
	}

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || res.statusText);
	}
	console.log('HISTORY RECEIVED: ', data);
	return { history: data };
}