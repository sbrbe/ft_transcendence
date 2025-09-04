/*
	Fonction pour faire une recherche de joueurs qui renvoie le profil du joueur contenant le username, le userId, l'avatar
	et l'historique de match.
	On affichera que le username et l'avatar
*/
export async function searchUser(username: string) {
	const res = await fetch(`/users/friends/searchUser/${encodeURIComponent(username)}`, {
		method: 'GET',
		credentials: 'include',
		headers: { Accept: 'application/json' },
	});
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
export async function sendFriendRequest(userId: string, friendUsername: string) {
	const res = await fetch('/users/friends/invite', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userId, friendUsername })
	});

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
export async function acceptRequest(userId: string, requestId: number) {
	const res = await fetch('/users/friends/accept', {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type' : 'application/json'},
		body: JSON.stringify({ userId, requestId })
	});

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
export async function rejectRequest(userId: string, requestId: number) {
		const res = await fetch('/users/friends/reject', {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type' : 'application/json'},
		body: JSON.stringify({ userId, requestId })
	});

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
export async function blockUser(userId: string, targetName: string) {
			const res = await fetch('/users/friends/block', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type' : 'application/json'},
		body: JSON.stringify({ userId, targetName })
	});

	if (res.ok && res.status === 200) return;

	let data: any = null;
	try {
		data = await res.json();
	}
	catch {}
	if (!res.ok) {
		throw new Error(data?.error || res.statusText || "Voud ne pouvez pas bloquer ce joueur");
	}
}

/**
 * Débloque un player.
 * Attend un 200 ; si erreur -> lève une exception.
 */
export async function unblockUser(userId: string, targetName: string) {
			const res = await fetch('/users/friends/unblock', {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type' : 'application/json'},
		body: JSON.stringify({ userId, targetName })
	});

	if (res.ok && res.status === 200) return;

	let data: any = null;
	try {
		data = await res.json();
	}
	catch {}
	if (!res.ok) {
		throw new Error(data?.error || res.statusText || "Vous ne pouvez pas débloquer ce joueur");
	}
}

/**
 * Bloque un player.
 * Attend un 200 ; si erreur -> lève une exception.
 */
export async function removeFriend(userId: string, targetName: string) {
			const res = await fetch('/users/friends/remove', {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type' : 'application/json'},
		body: JSON.stringify({ userId, targetName })
	});

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

export async function loadPendingRequest(userId: string) {
	const res = await fetch(`users/friends/request-pending/${encodeURIComponent(userId)}`, {
		method: 'GET',
		credentials: 'include',
		headers: { Accept: 'application/json' }
	});
	const data = await res.json();

	if (!res.ok) {
		throw new Error(data?.error || res.statusText);
	}
	return data;
}

export async function loadFriendsList(userId: string) {
	const res = await fetch(`/users/friends/my-friends/${encodeURIComponent(userId)}`, {
		method: 'GET',
		credentials: 'include',
		headers: { Accept: 'application/json' }
	});

	const data = await res.json();

	if (!res.ok) {
		 throw new Error(data?.error || res.statusText);
	}
	return data;
}