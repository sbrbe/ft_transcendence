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
  '/pong': () => import('../pages/pongLocl_Oln'),
  '/pong_local': () => import('../pages/pongLocal'),
  '/teams': () => import('../pages/teams')
  // tu peux ajouter d'autres routes ici
  // jsp moi, page truc truc => import ../truc/truc
};

let mountEl: HTMLElement;


/**
 * Convertit le hash de l'URL en chemin de route.
 * Exemple : "#/accueil" => "/accueil"
 * Si rien n'est fourni (URL vide), on redirige vers "/".
 */
function parseHash(): string 
{
  const hash = window.location.hash || '/';
  const path = hash.replace(/^#/, '');
  return path || '/';
}

export function navigateTo(path: string) 
{
  if (!path.startsWith('#')) 
  {
    window.location.hash = `#${path}`;
  } 
  else 
  {
    window.location.hash = path;
  }
}

async function render(path: string) 
{
  const loader = routes[path] ?? routes['/'];
  const mod = await loader();
  mountEl.innerHTML = '';
  mod.default(mountEl);
}

export function initRouter(opts: RouterOptions) 
{
  mountEl = opts.mount;

  window.addEventListener('hashchange', () => {
    const path = parseHash();
    render(path);
  });

  // Premier affichage, affiche la page correspondant au hash actuel
  render(parseHash());
}


/*
projet en SPA (Single Page Application)

Il n’y a qu’un seul fichier HTML (index.html) chargé par le navigateur.
Le contenu affiché change dynamiquement en JavaScript grâce à router.ts.
Ce router n’utilise pas le serveur pour charger des pages entières, mais fait un import dynamique (import('../pages/...')) pour afficher seulement la partie nécessaire dans <main>.
La navigation se fait avec le hash de l’URL (#/accueil, #/profil…), ce qui évite un rechargement complet du navigateur.

C’est un site en single page, avec un routage client basé sur window.location.hash.
*/