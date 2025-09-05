import { refreshOnce } from "./A2F";
import { logout } from "./auth";

export type PlayerStats = {
	wins: number;
	defeats: number;
};

export type Match = {
	opponentUsername: string;
	myScore: number;
	hisScore: number;
	result: 'WIN' | 'DEFEAT';
	playedAt: string;
};

export async function getPlayerStats(userId: string, retried = false) {
	const res = await fetch(`/service/stats/${encodeURIComponent(userId)}`, {
		method: 'GET',
		credentials: 'include',
		headers: { Accept: 'application/json '},
	});

	if (res.status === 401 && !retried) {
		const ok = await refreshOnce();
		if (ok) {
			return getPlayerStats(userId, true);
		} else {
			await logout();
		}
	}

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || res.statusText);
	}
	return {
		wins: data.wins,
		defeats: data.defeats
	};
}

export async function getMatchHistory(userId: string, retried = false) {
	const res = await fetch(`/service/match-history/${encodeURIComponent(userId)}`, {
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
	return data;
}

/**
 * Match history : 
 * 	- Opponent username
 * 	- Score
 * 	- Result
 * 	- Date
 */