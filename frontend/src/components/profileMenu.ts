import { navigateTo } from '../router/router';
import { logout } from '../api/auth';
import { AppUser } from '../utils/interface';

interface AttachOptions {
	onLogoutSuccess?: () => void;
}

export function attachProfileMenu(
	trigger: HTMLElement,
	user: AppUser,
	opts: AttachOptions = {}
) {
	const overlay = document.createElement('div');
	overlay.className = 'fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] hidden';

	const menu = document.createElement('div');
	menu.className = [
		'fixed z-50 w-80 max-w-[92vw]',
		'rounded-2xl border bg-white shadow-xl ring-1 ring-black/5',
		'hidden',
	].join(' ');

	const avatarSrc = resolveAvatarSrc(user.avatarPath);
	menu.innerHTML = `
    <div class="p-4 rounded-t-2xl bg-gradient-to-br from-white to-gray-50">
      <div class="flex items-center gap-3">
        <img id="pm-avatar" src="${escapeHtml(avatarSrc)}" alt="" class="h-12 w-12 rounded-xl ring-1 ring-black/10 object-cover">
        <div class="min-w-0">
          <div class="font-semibold text-gray-900 truncate">${escapeHtml(user.username)}</div>
          <div class="text-sm text-gray-600 truncate">${escapeHtml(user.email ?? '')}</div>
        </div>
      </div>
    </div>

    <div class="h-px bg-gray-100"></div>

    <nav class="p-2">
      <a href="#/profil" data-route="/profil"
         class="block px-3 py-2 rounded-lg text-sm text-gray-800 hover:bg-gray-100">Profile</a>

      <a href="#/statistiques" data-route="/statistics"
         class="block px-3 py-2 rounded-lg text-sm text-gray-800 hover:bg-gray-100">Statistics</a>

      <a href="#/friends" data-route="/friends"
         class="block px-3 py-2 rounded-lg text-sm text-gray-800 hover:bg-gray-100">Friends</a>
    </nav>

    <div class="h-px bg-gray-100"></div>

    <div class="p-3">
      <p class="mt-2 text-[11px] text-gray-500 text-center">Pong v1.0.2</p>
      <button id="logoutBtn"
        class="w-full px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-black transition">
        Logout
      </button>
    </div>
  `;

	document.body.appendChild(overlay);
	document.body.appendChild(menu);

	const pmImg = menu.querySelector<HTMLImageElement>('#pm-avatar')!;
	pmImg.addEventListener('error', () => { pmImg.src = '/avatar/default.png'; }, { once: true });


	function open() 
	{
		positionMenu(trigger, menu);
		overlay.classList.remove('hidden');
		menu.classList.remove('hidden');
	}
	function close() 
	{
		overlay.classList.add('hidden');
		menu.classList.add('hidden');
	}

	overlay.addEventListener('click', close);

	const onWinChange = () => {
	if (!menu.classList.contains('hidden')) positionMenu(trigger, menu);
	};
	window.addEventListener('resize', onWinChange);
	window.addEventListener('scroll', onWinChange, true);

	menu.addEventListener('click', (e) => 
	{
	const a = (e.target as HTMLElement).closest('a[data-route]') as HTMLAnchorElement | null;
	if (!a) return;
	e.preventDefault();
	const path = a.dataset.route || '/';
	close();
	navigateTo(path);
	});


	const logoutBtn = menu.querySelector<HTMLButtonElement>('#logoutBtn')!;
	logoutBtn.addEventListener('click', async () => {
		try 
		{
			logoutBtn.disabled = true;
			logoutBtn.classList.add('opacity-70', 'cursor-wait');
			await logout();
			close();
			opts.onLogoutSuccess?.();
			navigateTo('/home');
		} 
		catch (err: any) 
		{
			alert(`Error while disconnecting : ${err?.message || 'unknown'}`);
		} 
		finally 
		{
			logoutBtn.disabled = false;
			logoutBtn.classList.remove('opacity-70', 'cursor-wait');
		}
	});

	return {
		open,
		close,
		destroy() {
			overlay.remove();
			menu.remove();
			window.removeEventListener('resize', onWinChange);
			window.removeEventListener('scroll', onWinChange, true);
		}
	};
}

function positionMenu(trigger: HTMLElement, menu: HTMLElement) {
	const r = trigger.getBoundingClientRect();
	const gap = 8;
	const top = r.bottom + gap;
	const right = Math.max(8, window.innerWidth - r.right);
	menu.style.top = `${Math.min(top, window.innerHeight - 16)}px`;
	menu.style.right = `${right}px`;
}

function resolveAvatarSrc(input?: string | null): string {
	if (!input) return '/avatar/default.png';
	const s = input.trim();
	if (/^(https?:|data:|blob:)/i.test(s)) return s;
	const p = s.replace(/^\/+/, '');
	if (p === 'default.png') return '/avatar/default.png';
	if (p.startsWith('avatar/')) return '/' + p;
	if (!p.includes('/')) return '/avatar/' + p;
	return '/' + p;
}

function escapeHtml(s: string) {
	return s.replace(/[&<>"']/g, (m) => (
	{ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]!
	));
}



// import { navigateTo } from '../router/router';
// import { logout } from '../api/auth';
// import { AppUser } from '../utils/interface';
// import { loadNotifRequest } from '../api/friends';
// import { getSavedUser } from "../utils/ui";

// export interface AttachOptions {
// 	notificationCount?: number;
// 	onLogoutSuccess?: () => void;
// }

// export function attachProfileMenu(
// 	trigger: HTMLElement,
// 	user: AppUser | null,
// 	opts: AttachOptions = { notificationCount: 0 }
// ) {
// 	if (!user) {
// 		return {
// 			open() {},
// 			close() {},
// 			setNotificationCount() {},
// 			incrementNotification() {},
// 			clearNotification() {},
// 			destroy() {}
// 		};
// 	}

// 	let notifCount = 0;
// 	let poller: number | undefined;

// 	trigger.classList.add('relative');
// 	const triggerBadge = document.createElement('span');
// 	triggerBadge.className = [
// 		'pointer-events-none',
// 		'absolute -top-1 -right-1',
// 		'min-w-5 h-5 px-1',
// 		'rounded-full bg-red-600 text-white',
// 		'text-[11px] leading-5 text-center font-semibold',
// 		'ring-2 ring-white shadow',
// 		'select-none',
// 		'hidden',
// 	].join(' ');
// 	triggerBadge.setAttribute('aria-live', 'polite');
// 	trigger.appendChild(triggerBadge);

// 	const overlay = document.createElement('div');
// 	overlay.className = 'fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] hidden';

// 	const menu = document.createElement('div');
// 	menu.className = [
// 		'fixed z-50 w-80 max-w-[92vw]',
// 		'rounded-2xl border bg-white shadow-xl ring-1 ring-black/5',
// 		'hidden',
// 	].join(' ');

// 	const avatarSrc = resolveAvatarSrc(user.avatarPath);
// 	menu.innerHTML = [
// 		'<div class="p-4 rounded-t-2xl bg-gradient-to-br from-white to-gray-50">',
// 		'  <div class="flex items-center gap-3">',
// 		`    <img id="pm-avatar" src="${escapeHtml(avatarSrc)}" alt="" class="h-12 w-12 rounded-xl ring-1 ring-black/10 object-cover">`,
// 		'    <div class="min-w-0">',
// 		`      <div class="font-semibold text-gray-900 truncate">${escapeHtml(user.username)}</div>`,
// 		`      <div class="text-sm text-gray-600 truncate">${escapeHtml(user.email ?? '')}</div>`,
// 		'    </div>',
// 		'  </div>',
// 		'</div>',
// 		'<div class="h-px bg-gray-100"></div>',
// 		'<nav class="p-2" id="pm-nav">',
// 		'  <a href="#/profil" data-route="/profil" class="pm-link block px-3 py-2 rounded-lg text-sm text-gray-800 hover:bg-gray-100">Profil</a>',
// 		'  <a href="#/friends" data-route="/friends" ',
// 		'     class="pm-link relative block px-3 py-2 pr-9 rounded-lg text-sm text-gray-800 hover:bg-gray-100" ',
// 		'     id="pm-friends-link">',
// 		'    Friends',
// 		'    <span id="pm-friends-dot" class="hidden absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-600 ring-1 ring-white shadow"></span>',
// 		'  </a>',
// 		'</nav>',
// 		'<div class="h-px bg-gray-100"></div>',
// 		'<div class="p-3">',
// 		'  <p class="mt-2 text-[11px] text-gray-500 text-center">Pong v1.0.2</p>',
// 		'  <button id="logoutBtn" class="w-full px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-black transition">Logout</button>',
// 		'</div>',
// 	].join('');

// 	document.body.appendChild(overlay);
// 	document.body.appendChild(menu);

// 	const pmImg = menu.querySelector<HTMLImageElement>('#pm-avatar')!;
// 	const nav = menu.querySelector<HTMLElement>('#pm-nav')!;
// 	const friendsLink = menu.querySelector<HTMLAnchorElement>('#pm-friends-link')!;
// 	const friendsDot = menu.querySelector<HTMLSpanElement>('#pm-friends-dot')!;
// 	const logoutBtn = menu.querySelector<HTMLButtonElement>('#logoutBtn')!;

// 	friendsDot.style.cssText = [
// 		'width:10px',
// 		'height:10px',
// 		'border-radius:9999px',
// 		'background:#ef4444',
// 		'box-shadow:0 0 0 1px #fff',
// 		'vertical-align:middle'
// 	].join(';');

// 	pmImg.addEventListener('error', () => { pmImg.src = '/avatar/default.png'; }, { once: true });

// 	function open() {
// 		overlay.classList.remove('hidden');
// 		menu.classList.remove('hidden');
// 		positionMenu(trigger, menu);
// 		syncFriendsDot(notifCount);
// 	}
	
// 	function close() {
// 		overlay.classList.add('hidden');
// 		menu.classList.add('hidden');
// 	}
// 	overlay.addEventListener('click', close);

// 	const onWinChange = () => {
// 		if (!menu.classList.contains('hidden')) positionMenu(trigger, menu);
// 	};
// 	window.addEventListener('resize', onWinChange);
// 	window.addEventListener('scroll', onWinChange, true);

// 	nav.addEventListener('click', (e) => {
// 		const a = (e.target as HTMLElement).closest('a[data-route]') as HTMLAnchorElement | null;
// 		if (!a) return;
// 		e.preventDefault();
// 		const path = a.dataset.route || '/';
// 		close();
// 		navigateTo(path);
// 	});

// 	logoutBtn.addEventListener('click', async () => {
// 		try {
// 			logoutBtn.disabled = true;
// 			logoutBtn.classList.add('opacity-70', 'cursor-wait');
// 			await logout();
// 			close();
// 			opts.onLogoutSuccess?.();
// 			navigateTo('/connection');
// 		} catch (err: any) {
// 			alert(`Error while disconnecting : ${err?.message || 'unknown'}`);
// 		} finally {
// 			logoutBtn.disabled = false;
// 			logoutBtn.classList.remove('opacity-70', 'cursor-wait');
// 		}
// 	});

// 	function syncTriggerBadge(count: number) {
// 		const visible = count > 0;
// 		triggerBadge.classList.toggle('hidden', !visible);
// 		triggerBadge.textContent = visible ? (count > 99 ? '99+' : String(count)) : '';
// 		triggerBadge.title = visible ? `${count} notification${count > 1 ? 's' : ''}` : '';
// 	}

// 	function syncFriendsDot(count: number) {
// 		const visible = count > 0;
// 		friendsDot.classList.toggle('hidden', !visible);
// 		friendsLink.setAttribute('aria-label', visible ? 'Friends (nouveaux éléments)' : 'Friends');
// 	}

// 	function setNotificationCount(n: number) {
// 		notifCount = Math.max(0, n | 0);
// 		syncTriggerBadge(notifCount);
// 		syncFriendsDot(notifCount);
// 	}

// 	function incrementNotification(delta = 1) {
// 		setNotificationCount(notifCount + delta);
// 	}

// 	function clearNotification() {
// 		setNotificationCount(0);
// 	}

// 	setNotificationCount(opts.notificationCount ?? 0);

// 	async function refreshFriends() {
// 		const current = getSavedUser<AppUser>();
// 		if (!current) { stopPolling(); return; }
// 		try {
// 			//const res = await loadNotifRequest(current.userId);
// 			//const count = Array.isArray(res?.list) ? res.list.length : (Array.isArray(res) ? res.length : 0);
// 			//setNotificationCount(count);
// 		} catch {}
// 	}

// 	function shouldPoll() {
// 		return document.visibilityState === 'visible' && !!getSavedUser<AppUser>();
// 	}
// 	function startPolling() {
// 		if (poller || !shouldPoll()) return;
// 		poller = window.setInterval(refreshFriends, 5000);
// 	}
// 	function stopPolling() {
// 		if (poller) { clearInterval(poller); poller = undefined; }
// 	}

// 	(async () => {
// 		const current = getSavedUser<AppUser>();
// 		if (current) {
// 			try {
// 				const res = await loadNotifRequest(current.userId);
// 				const count = Array.isArray(res?.list) ? res.list.length : (Array.isArray(res) ? res.length : 0);
// 				setNotificationCount(count);
// 			} catch {}
// 			startPolling();
// 		}
// 	})();

// 	const onVis = () => { if (shouldPoll()) startPolling(); else stopPolling(); };
// 	const onAuthChanged = () => { if (shouldPoll()) startPolling(); else stopPolling(); };

// 	document.addEventListener('visibilitychange', onVis);
// 	window.addEventListener('auth:changed', onAuthChanged);

// 	return {
// 		open,
// 		close,
// 		setNotificationCount,
// 		incrementNotification,
// 		clearNotification,
// 		destroy() {
// 			stopPolling();
// 			document.removeEventListener('visibilitychange', onVis);
// 			window.removeEventListener('auth:changed', onAuthChanged);
// 			overlay.remove();
// 			menu.remove();
// 			triggerBadge.remove();
// 			window.removeEventListener('resize', onWinChange);
// 			window.removeEventListener('scroll', onWinChange, true);
// 		},
// 	};
// }

// function positionMenu(trigger: HTMLElement, menu: HTMLElement) {
// 	const r = trigger.getBoundingClientRect();
// 	const gap = 8;

// 	// Mesures réelles une fois visible
// 	const mw = menu.offsetWidth || 320;
// 	const mh = menu.offsetHeight || 200;

// 	let top = r.bottom + gap;
// 	top = Math.min(Math.max(8, top), window.innerHeight - mh - 8);

// 	// On tente d’aligner le menu avec le bord droit du trigger
// 	let left = r.right - mw;
// 	// Clamp dans l’écran
// 	left = Math.min(Math.max(8, left), window.innerWidth - mw - 8);

// 	menu.style.top = `${top}px`;
// 	menu.style.left = `${left}px`;
// 	menu.style.right = 'auto';
// }


// function resolveAvatarSrc(input?: string | null): string {
// 	if (!input) return '/avatar/default.png';
// 	const s = input.trim();
// 	if (/^(https?:|data:|blob:)/i.test(s)) return s;
// 	const p = s.replace(/^\/+/, '');
// 	if (p === 'default.png') return '/avatar/default.png';
// 	if (p.startsWith('avatar/')) return '/' + p;
// 	if (!p.includes('/')) return '/avatar/' + p;
// 	return '/' + p;
// }

// function escapeHtml(s: string) {
// 	return s.replace(/[&<>"']/g, (m) => (
// 		{ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]!
// 	));
// }