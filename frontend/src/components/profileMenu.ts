// src/components/profileMenu.ts
import { navigateTo } from '../router/router';
import { logout, AppUser } from '../api/auth';

interface AttachOptions { onLogoutSuccess?: () => void; }

export function attachProfileMenu(
  trigger: HTMLElement,
  user: AppUser,
  opts: AttachOptions = {}
) {
  /* ---------------- Overlay (clic extérieur + blur) ---------------- */
  const overlay = document.createElement('div');
  overlay.className = [
    'fixed inset-0 z-40',
    'bg-black/20 backdrop-blur-[2px]',
    'opacity-0 pointer-events-none transition-opacity',
  ].join(' ');

  /* ---------------- Conteneur du menu ---------------- */
  const menu = document.createElement('div');
  menu.className = [
    'fixed z-50 w-[22rem] max-w-[92vw] outline-none',
    // glass + contour
    'rounded-2xl border border-white/60',
    'bg-white/80 backdrop-blur-xl',
    'shadow-2xl ring-1 ring-black/5',
    // animation
    'scale-95 opacity-0 pointer-events-none',
    'transition duration-150 ease-out',
  ].join(' ');
  menu.setAttribute('role', 'menu');
  menu.setAttribute('tabindex', '-1');

  const avatarSrc = resolveAvatarSrc(user.avatarUrl);

  /* ---------------- Template ---------------- */
  menu.innerHTML = `
    <style>
      /* Petite anim d’apparition */
      .pm-enter { transform: scale(0.98); opacity: 0; }
      .pm-enter-active { transform: scale(1); opacity: 1; }
      .pm-leave { transform: scale(1); opacity: 1; }
      .pm-leave-active { transform: scale(0.98); opacity: 0; }

      /* Joli séparateur central avec gradient */
      .pm-sep { height: 1px; background-image: linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.12), rgba(0,0,0,0)); }

      /* Labels de section */
      .pm-label { font-size: 0.72rem; letter-spacing: .08em; text-transform: uppercase; }
    </style>

    <!-- Header / identité -->
    <div class="p-4 rounded-t-2xl bg-gradient-to-br from-white/80 to-gray-50/80">
      <div class="flex items-center gap-3">
        <img id="pm-avatar" src="${avatarSrc}" alt="Avatar"
             class="h-12 w-12 rounded-xl ring-1 ring-black/10 object-cover">
        <div class="min-w-0">
          <div class="font-semibold text-gray-900 truncate">${escapeHtml(user.username)}</div>
          <div class="text-sm text-gray-600 truncate">${escapeHtml(user.email ?? '')}</div>
        </div>
      </div>
    </div>

    <div class="pm-sep"></div>

    <!-- Section : Navigation principale -->
    <div class="p-2">
      <div class="px-2 py-1 pm-label text-gray-500">Navigation</div>


<!--NAVBAR PROFILE MENU  -->
      <a href="#/profil" data-route="/profil" role="menuitem" data-mi
         class="block px-3 py-2 mt-1 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
        Voir le profil
      </a>

      <a href="#/statistiques" data-route="/statistiques" role="menuitem" data-mi
         class="block px-3 py-2 mt-1 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
        statistiques --> [A Faire]
      </a>

      <a href="#/friends" data-route="/friends" role="menuitem" data-mi
         class="block px-3 py-2 mt-1 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
        Amis --> [A Faire]
      </a>

      <a href="#/pong" data-route="/pong" role="menuitem" data-mi
         class="block px-3 py-2 mt-1 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
        Pong [A Faire]
      </a>
      <a href="#/....." data-route="/..." role="menuitem" data-mi
         class="block px-3 py-2 mt-1 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
        Autre ....
      </a>
      <a href="#/....." data-route="/..." role="menuitem" data-mi
         class="block px-3 py-2 mt-1 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
        Autre ....
      </a>
    </div>

    <div class="pm-sep"></div>

    <!-- Section : Compte -->
    <div class="p-2">
      <div class="px-2 py-1 pm-label text-gray-500">ft_transcendence V1.0.0</div>
      <button id="logoutBtn" role="menuitem" data-mi
        class="w-full px-3 py-2 mt-1 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 transition">
        Déconnexion
      </button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(menu);

  /* ---------------- Fallback avatar ---------------- */
  const pmImg = menu.querySelector<HTMLImageElement>('#pm-avatar')!;
  pmImg.addEventListener('error', () => { pmImg.src = '/avatar/default.png'; }, { once: true });

  /* ---------------- Ouverture / Fermeture ---------------- */
  function open() {
    positionMenu(trigger, menu);
    overlay.classList.remove('pointer-events-none', 'opacity-0');
    overlay.classList.add('opacity-100');

    menu.classList.remove('pointer-events-none');
    // anim
    menu.classList.add('pm-enter-active');
    menu.classList.remove('pm-leave', 'pm-leave-active');
    menu.classList.add('pm-enter');
    requestAnimationFrame(() => {
      menu.classList.remove('pm-enter');
      menu.classList.add('opacity-100', 'scale-100');
    });

    // focus 1er item
    const firstItem = menu.querySelector<HTMLElement>('[data-mi]');
    (firstItem ?? menu).focus();
  }

  function close() {
    overlay.classList.add('opacity-0');
    overlay.classList.remove('opacity-100');
    // anim out
    menu.classList.add('pm-leave-active');
    menu.classList.remove('pm-enter', 'pm-enter-active');
    setTimeout(() => {
      overlay.classList.add('pointer-events-none');
      menu.classList.add('pointer-events-none');
      menu.classList.remove('opacity-100', 'scale-100');
    }, 120);
  }

  /* ---------------- Interactions globales ---------------- */
  overlay.addEventListener('click', close);
  window.addEventListener('resize', () => { if (!menu.classList.contains('pointer-events-none')) positionMenu(trigger, menu); });
  window.addEventListener('scroll', () => { if (!menu.classList.contains('pointer-events-none')) positionMenu(trigger, menu); }, true);

  document.addEventListener('keydown', (e) => {
    if (menu.classList.contains('pointer-events-none')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); trigger.focus(); }
    if (e.key === 'Tab') { trapFocus(e); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { moveFocus(e.key === 'ArrowDown'); e.preventDefault(); }
  });

  // Navigation interne
  menu.addEventListener('click', (e) => {
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
    try {
      logoutBtn.disabled = true;
      logoutBtn.classList.add('opacity-70', 'cursor-wait');
      await logout();                // nettoie + notifie auth:changed
      close();
      opts.onLogoutSuccess?.();
      navigateTo('/accueil');
    } catch (err: any) {
      alert(`Erreur de déconnexion : ${err?.message || 'inconnue'}`);
    } finally {
      logoutBtn.disabled = false;
      logoutBtn.classList.remove('opacity-70', 'cursor-wait');
    }
  });

  return { open, close, destroy: () => { overlay.remove(); menu.remove(); } };

  /* ---------------- Helpers accessibilité ---------------- */
  function getMenuItems(): HTMLElement[] {
    return Array.from(menu.querySelectorAll<HTMLElement>('[data-mi]'));
  }
  function moveFocus(next: boolean) {
    const items = getMenuItems();
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement as HTMLElement);
    const nextIdx = idx < 0
      ? 0
      : (next ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length);
    items[nextIdx].focus();
  }
  function trapFocus(e: KeyboardEvent) {
    const items = getMenuItems();
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    const active = document.activeElement as HTMLElement;
    if (e.shiftKey && active === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault(); first.focus();
    }
  }
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
  return s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]!));
}
