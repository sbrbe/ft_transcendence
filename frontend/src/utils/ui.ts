import { AppUser } from "./interface";

export type StatusKind = 'success' | 'error' | undefined;


const PENDING_KEY = 'pendingUserId';

export function setPendingUserId(userId: string) {
	sessionStorage.setItem(PENDING_KEY, userId);
}
export function getPendingUserId(): string | null {
	return sessionStorage.getItem(PENDING_KEY);
}
export function clearPendingUserId() {
	sessionStorage.removeItem(PENDING_KEY);
}


export function setLoggedInUser(user: AppUser) {
	localStorage.setItem('user', JSON.stringify(user));
	window.dispatchEvent(new CustomEvent('auth:changed', { detail: user }));
}

 export function clearUser() {
	localStorage.removeItem('user');
	window.dispatchEvent(new CustomEvent('auth:changed', { detail: null }));
}

export function getSavedUser<T = AppUser>(): T | null {
	try { return JSON.parse(localStorage.getItem('user') || 'null'); }
	catch { return null; }
}

export function setStatusMessage(el: HTMLElement, text = '', kind?: StatusKind) 
{
	el.textContent = text;
	const base = 'text-sm';
	const color =
		kind === 'success' ? 'text-green-600' :
		kind === 'error'	 ? 'text-red-600'	 : '';
	el.className = [base, color].filter(Boolean).join(' ');
}

export function clearStatusMessage(el: HTMLElement) 
{
	setStatusMessage(el);
}

export function lockButton(btn: HTMLButtonElement, disabled: boolean, loadingLabel?: string) 
{
	btn.disabled = disabled;
	btn.setAttribute('aria-disabled', String(disabled));
	btn.classList.toggle('opacity-70', disabled);
	btn.classList.toggle('cursor-not-allowed', disabled);

	if (disabled) {
		if (!btn.dataset.prevLabel) btn.dataset.prevLabel = btn.textContent || '';
		if (loadingLabel) btn.textContent = loadingLabel;
	} else if (btn.dataset.prevLabel) {
		btn.textContent = btn.dataset.prevLabel;
		delete btn.dataset.prevLabel;
	}
}

export function bindPasswordToggle
(
	input: HTMLInputElement,
	button: HTMLButtonElement,
	showLabel = 'Show',
	hideLabel = 'Hide'
) {
	const onClick = () => {
		const isPwd = input.type === 'password';
		input.type = isPwd ? 'text' : 'password';
		button.textContent = isPwd ? hideLabel : showLabel;
	};
	button.addEventListener('click', onClick);
	return () => button.removeEventListener('click', onClick);
}

export function normaliseAvatar(input?: string | null): string {
	if (!input) return '';
	const s = input.trim();
	if (!s) return '';
	if (/^(https?:|data:|blob:)/i.test(s)) return s;
	const p = s.replace(/^\/+/, '');
	if (p.startsWith('avatar/')) return '/' + p;
	if (!p.includes('/')) return '/avatar/' + p;
	return '/' + p;
}

export function escapeHtml(s: string) {
	return s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]!));
}

export function escapeAttr(s: string) {
	return escapeHtml(s).replace(/"/g, '&quot;');
}