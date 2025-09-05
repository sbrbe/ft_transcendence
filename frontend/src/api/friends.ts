import { refreshOnce } from "./A2F";
import { logout } from "./auth";

/*
	Fonction pour faire une recherche de joueurs qui renvoie le profil du joueur contenant le username, le userId, l'avatar
	et l'historique de match.
	On affichera que le username et l'avatar
*/
export async function searchUser(username: string, retried = false) {
	const res = await fetch(`/users/friends/searchUser/${encodeURIComponent(username)}`, {
		method: 'GET',
		credentials: 'include',
		headers: { Accept: 'application/json' },
	});

	if (res.status === 401 && !retried) {
		const ok = await refreshOnce();
		if (ok) {
			return searchUser(username, true);
		} else {
			await logout();
		}
	}
	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || res.statusText);
	}
	return {
		userId: data.userId,
		username,
		avatarPath: data.avatarPath
	};
}


/**
 * Envoie une demande d'ami à un player donné.
 * Attend un 201 ; si erreur -> lève une exception.
 */
export async function sendFriendRequest(userId: string, friendUsername: string, retried = false) {
	const res = await fetch('/users/friends/invite', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userId, friendUsername })
	});

	if (res.status === 401 && !retried) {
		const ok = await refreshOnce();
		if (ok) {
			return sendFriendRequest(userId, friendUsername, true);
		} else {
			await logout();
		}
	}
	if (res.ok && res.status === 201) return;

	let data: any = null;
	try {
		data = await res.json();
	}
	catch {}
	if (!res.ok) {
		throw new Error(data?.error || res.statusText || 'Invitation failed');
	}
}

/**
 * Accepte une demande d'ami.
 * Attend un 200 ; si erreur -> lève une exception.
 */
export async function acceptRequest(userId: string, requestId: number, retried = false) {
	const res = await fetch('/users/friends/accept', {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type' : 'application/json'},
		body: JSON.stringify({ userId, requestId })
	});

	if (res.status === 401 && !retried) {
		const ok = await refreshOnce();
		if (ok) {
			return acceptRequest(userId, requestId, true);
		} else {
			await logout();
		}
	}
	if (res.ok && res.status === 200) return;

	let data: any = null;
	try {
		data = await res.json();
	}
	catch {}
	if (!res.ok) {
		throw new Error(data?.error || res.statusText || '');
	}
}

/**
 * Rejette une demande d'ami.
 * Attend un 200 ; si erreur -> lève une exception.
 */
export async function rejectRequest(userId: string, requestId: number, retried = false) {
		const res = await fetch('/users/friends/reject', {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type' : 'application/json'},
		body: JSON.stringify({ userId, requestId })
	});

	if (res.status === 401 && !retried) {
		const ok = await refreshOnce();
		if (ok) {
			return rejectRequest(userId, requestId, true);
		} else {
			await logout();
		}
	}
	if (res.ok && res.status === 200) return;

	let data: any = null;
	try {
		data = await res.json();
	}
	catch {}
	if (!res.ok) {
		throw new Error(data?.error || res.statusText || "Failed to reject friend request");
	}
}

/**
 * Bloque un player.
 * Attend un 200 ; si erreur -> lève une exception.
 */
export async function removeFriend(userId: string, friendUsername: string, retried = false) {
			const res = await fetch('/users/friends/remove', {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type' : 'application/json'},
		body: JSON.stringify({ userId, friendUsername })
	});

	if (res.status === 401 && !retried) {
		const ok = await refreshOnce();
		if (ok) {
			return removeFriend(userId, friendUsername, true);
		} else {
			await logout();
		}
	}
	if (res.ok && res.status === 200) return;

	let data: any = null;
	try {
		data = await res.json();
	}
	catch {}
	if (!res.ok) {
		throw new Error(data?.error || res.statusText || "Vous ne pouvez pas retirer ce joueur de vos amis");
	}
}

export async function loadPendingRequest(userId: string, retried = false) {
	const res = await fetch(`users/friends/request-pending/${encodeURIComponent(userId)}`, {
		method: 'GET',
		credentials: 'include',
		headers: { Accept: 'application/json' }
	});
	const data = await res.json();

	if (res.status === 401 && !retried) {
		const ok = await refreshOnce();
		if (ok) {
			return loadPendingRequest(userId, true);
		} else {
			await logout();
		}
	}
	if (!res.ok) {
		throw new Error(data?.error || res.statusText);
	}
	return data;
}

export async function loadFriendsList(userId: string, retried = false) {
	const res = await fetch(`/users/friends/my-friends/${encodeURIComponent(userId)}`, {
		method: 'GET',
		credentials: 'include',
		headers: { Accept: 'application/json' }
	});

	if (res.status === 401 && !retried) {
		const ok = await refreshOnce();
		if (ok) {
			return loadFriendsList(userId, true);
		} else {
			await logout();
		}
	}
	const data = await res.json();

	if (!res.ok) {
		 throw new Error(data?.error || res.statusText);
	}
	return data;
}