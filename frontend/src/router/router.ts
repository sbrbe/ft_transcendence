type RouteHandler = (container: HTMLElement) => void;

interface RouterOptions 
{
	mount: HTMLElement; 
}

const routes: Record<string, () => Promise<{ default: RouteHandler }>> = 
{
	'/': () => import('../pages/home'),
	'/home': () => import('../pages/home'),
	'/register': () => import('../pages/register'),
	'/connection': () => import('../pages/login'),
	'/a2f': () => import('../pages/A2F'),
	'/profil': () => import('../pages/profile'),
	'/friends': () => import('../pages/friends'),
	'/statistics': () => import('../pages/statistics'),
	'/pong': () => import('../pages/pong'),
	'/friend-profile': () => import('../pages/friendProfile'),
};

let mountEl: HTMLElement;

function parseHash(): string {
	const hash = window.location.hash || '/';
	const path = hash.replace(/^#/, '');
	const pathname = path.split('?')[0];
	return pathname || '/';
}

export function navigateTo(path: string) {
	if (!path.startsWith('#')) 
	{
		window.location.hash = `#${path}`;
	} 
	else 
	{
		window.location.hash = path;
	}
}

async function render(path: string) {
	const loader = routes[path] ?? routes['/'];
	const mod = await loader();
	mountEl.innerHTML = '';
	mod.default(mountEl);
}

export function initRouter(opts: RouterOptions) {
	mountEl = opts.mount;

	window.addEventListener('hashchange', () => {
		const path = parseHash();
		render(path);
	});
	render(parseHash());
}


