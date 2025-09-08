import { refreshOnce } from './A2F';
import { logout } from './auth';

export interface UploadAvatarResponse {
	avatarUrl: string;
	etag: string;
}

export interface ListAvatarsResponse {
	avatars: string[];
}

export async function uploadAvatar(
	userId: string,
	file: File,
	retried = false
): Promise<UploadAvatarResponse> {
            	const allowed = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);
	if (!allowed.has(file.type)) {
		throw new Error('Unsupported file type (PNG/JPEG/WEBP only)');
	}

	const form = new FormData();
	form.append('file', file);

	const res = await fetch(`/users/uploadAvatar/${encodeURIComponent(userId)}`, {
		method: 'POST',
		credentials: 'include',
		body: form,
	});

	if (res.status === 401 && !retried) {
		const ok = await refreshOnce();
		if (ok) return uploadAvatar(userId, file, true);
		await logout();
	}

	let data: any = {};
	try { data = await res.json(); } catch {}

	if (!res.ok) {
		throw new Error(data?.error || `Upload failed (${res.status})`);
	}

	return data as UploadAvatarResponse;
}

export async function listUserAvatars(
	userId: string,
	retried = false
): Promise<string[]> {
	const res = await fetch(`/users/avatars/${encodeURIComponent(userId)}`, {
		method: 'GET',
		credentials: 'include',
	});

	if (res.status === 401 && !retried) {
		const ok = await refreshOnce();
		if (ok) return listUserAvatars(userId, true);
		await logout();
	}

	if (res.status === 404) {
		return [];
	}

	let data: any = {};
	try { data = await res.json(); } catch {}

	if (!res.ok) {
		throw new Error(data?.error || `List avatars failed (${res.status})`);
	}

	return Array.isArray(data.avatars) ? data.avatars : [];
}

export function isUploadedAvatar(url?: string | null): boolean {
	return !!url && url.startsWith('/static/avatars/');
}
