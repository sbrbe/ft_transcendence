import { getSavedUser } from '../utils/ui';
import { escapeHtml } from '../utils/ui';

export function createNavbar(onNavigate: (path: string) => void) {
	const nav = document.createElement('nav');
	nav.className = 'container-page my-4';
	nav.setAttribute('role', 'navigation');

	nav.innerHTML = `
    <div class="flex items-center justify-between rounded-2xl border shadow-sm
                bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 px-4 py-3">

<!-- Gauche: logo + marque + liens -->
      <div class="flex items-center gap-4">
        <!-- Marque -->
        <a href="#/home" data-route="/home"
           class="flex items-center gap-3 select-none"
           aria-label="Return home (Ft_transcendence)">
          <img src="/site/logo.png" alt="Logo" class="h-9 w-9 rounded-xl ring-1 ring-black/5 object-cover">
          <span class="text-base md:text-lg font-semibold tracking-tight">Pong</span>
        </a>

<!-- Liens principaux -->
        <div class="hidden sm:flex items-center gap-1" aria-label="Navigation principale">
          <a href="#/home" data-route="/home" data-nav
             class="text-sm font-medium text-gray-700 hover:text-gray-900
                    px-3 py-1.5 rounded-xl hover:bg-gray-100 active:bg-gray-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
            Home
          </a>

          <a href="#/pong" data-route="/pong" data-nav
             class="text-sm font-medium text-gray-700 hover:text-gray-900
                    px-3 py-1.5 rounded-xl hover:bg-gray-100 active:bg-gray-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
            Play
          </a>

        </div>
      </div>

      <!-- Droite -->
      <div id="nav-right" class="flex items-center gap-2 sm:gap-3"></div>
    </div>
  `;

	nav.addEventListener('click', (e) => {
		const a = (e.target as HTMLElement).closest('a[data-route]') as HTMLAnchorElement | null;
		if (!a) return;
		e.preventDefault();
		onNavigate(a.dataset.route || '/');
	});

	const setActive = () => {
		const current = location.hash.replace(/^#/, '') || '/';
		nav.querySelectorAll<HTMLAnchorElement>('a[data-route]').forEach(a => {
		const isActive = a.dataset.route === current || (current === '/' && a.dataset.route === '/accueil');
		a.classList.toggle('bg-gray-100', isActive);
		});
	};
	window.addEventListener('hashchange', setActive);

	const renderRight = async () => {
	const right = nav.querySelector<HTMLDivElement>('#nav-right')!;
	const user = getSavedUser<{ username: string; avatarPath?: string }>();

	if (!user) {
		right.innerHTML = `
        <a href="#/connexion" data-route="/connection"
           class="text-sm font-medium text-gray-700 hover:text-gray-900
                  px-3 py-1.5 rounded-xl hover:bg-gray-100 active:bg-gray-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
          Login
        </a>
        <a href="#/inscription" data-route="/register"
           class="text-sm font-medium text-gray-700 hover:text-gray-900
                  px-3 py-1.5 rounded-xl hover:bg-gray-100 active:bg-gray-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
          Sign up
        </a>
      `;
		return;
	}

	const avatarSrc = resolveAvatarSrc(user.avatarPath);
	right.innerHTML = `
      <button type="button" id="btn-profile"
        class="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-gray-100 focus:outline-none
               focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
        <img id="btn-profile-img" src="${escapeHtml(avatarSrc)}" alt="" class="h-8 w-8 rounded-lg ring-1 ring-black/5 object-cover">
        <span class="text-sm font-medium">${escapeHtml(user.username)}</span>
        <svg viewBox="0 0 20 20" class="h-4 w-4" aria-hidden="true"><path d="M5 7l5 5 5-5" fill="currentColor"/></svg>
      </button>
    `;

	const img = right.querySelector<HTMLImageElement>('#btn-profile-img')!;
	img.addEventListener('error', () => { img.src = '/avatar/default.png'; }, { once: true });

	const btn = right.querySelector<HTMLButtonElement>('#btn-profile')!;
	const { attachProfileMenu } = await import('./profileMenu');
	const { open } = attachProfileMenu(btn, getSavedUser()!, {
		onLogoutSuccess: () => { renderRight(); setActive(); }
	});
	btn.addEventListener('click', (e) => { e.preventDefault(); open(); });
	};

	window.addEventListener('auth:changed', renderRight);

	renderRight();
	setActive();

	return nav;
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
