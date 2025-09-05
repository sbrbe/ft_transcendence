import { navigateTo } from '../router/router';
import { logout } from '../api/auth';
import { AppUser } from '../utils/interface';

interface AttachOptions {
  onLogoutSuccess?: () => void;
}

/**
 * Menu profil simple et lisible.
 * - Overlay pour fermer en cliquant à l’extérieur
 * - Menu positionné près du trigger
 * - Liens vers /profil, /statistiques, /amis
 * - Déconnexion via api/auth.logout()
 */
export function attachProfileMenu(
  trigger: HTMLElement,
  user: AppUser,
  opts: AttachOptions = {}
) {
  // --------- Overlay (clic extérieur) ---------
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] hidden';

  // --------- Conteneur du menu ---------
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
        <img id="pm-avatar" src="${avatarSrc}" alt="" class="h-12 w-12 rounded-xl ring-1 ring-black/10 object-cover">
        <div class="min-w-0">
          <div class="font-semibold text-gray-900 truncate">${escapeHtml(user.username)}</div>
          <div class="text-sm text-gray-600 truncate">${escapeHtml(user.email ?? '')}</div>
        </div>
      </div>
    </div>

    <div class="h-px bg-gray-100"></div>

    <nav class="p-2">
      <a href="#/profil" data-route="/profil"
         class="block px-3 py-2 rounded-lg text-sm text-gray-800 hover:bg-gray-100">Profil</a>

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

  //avatar
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

  // Click extérieur
  overlay.addEventListener('click', close);

  // Repositionnement si scroll/resize
  const onWinChange = () => {
    if (!menu.classList.contains('hidden')) positionMenu(trigger, menu);
  };
  window.addEventListener('resize', onWinChange);
  window.addEventListener('scroll', onWinChange, true);

  // Navigation interne
  menu.addEventListener('click', (e) => 
  {
    const a = (e.target as HTMLElement).closest('a[data-route]') as HTMLAnchorElement | null;
    if (!a) return;
    e.preventDefault();
    const path = a.dataset.route || '/';
    close();
    navigateTo(path);
  });


  // Déconnexion
  const logoutBtn = menu.querySelector<HTMLButtonElement>('#logoutBtn')!;
  logoutBtn.addEventListener('click', async () => {
    try 
    {
      logoutBtn.disabled = true;
      logoutBtn.classList.add('opacity-70', 'cursor-wait');
      await logout(); // -> nettoie le storage + dispatch "auth:changed"
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

/* ---------------- Helpers ---------------- */

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
