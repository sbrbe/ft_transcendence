// src/pages/profile.ts
import { navigateTo } from '../router/router';
import { getSavedUser, AppUser } from '../api/auth';
import { initChangeAvatar } from '../features/changeAvatar';
import { initUpdateBasics } from '../features/updateBasics';
import { initChangePassword } from '../features/changePassword';

import { normalizeAvatar } from '../utils/avatar';
import { escapeHtml, escapeAttr } from '../utils/sanitize';

const AVATARS = [
  '/avatar/default.png',
  '/avatar/avatar1.png',
  '/avatar/avatar2.png',
  '/avatar/avatar3.png',
  '/avatar/avatar4.png',
  '/avatar/avatar5.png',
  '/avatar/avatar6.png',
  '/avatar/avatar7.png',
  '/avatar/avatar8.png',
  '/avatar/avatar9.png',
  '/avatar/avatar10.png',
  '/avatar/avatar11.png',
  '/avatar/avatar12.png',
  '/avatar/avatar13.png',
  '/avatar/avatar14.png',
];

const ProfilePage: (container: HTMLElement) => void = (container) => {
  const saved = getSavedUser<AppUser>();
  if (!saved) {
    navigateTo('/connexion');
    return;
  }

  const currentAvatar = normalizeAvatar(saved.avatarUrl) || AVATARS[0];

  container.innerHTML = `
    <div class="container-page my-10 grid gap-6 lg:grid-cols-3">
      <!-- Carte identité -->
      <section class="rounded-2xl border bg-white shadow-sm p-6 h-max">
        <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Identité</h2>
        <div class="flex items-center gap-4">
          <img id="pp-avatar" src="${escapeAttr(currentAvatar)}" alt="Avatar"
               class="h-16 w-16 rounded-xl ring-1 ring-black/10 object-cover">
          <div class="min-w-0">
            <div id="pp-username" class="font-semibold text-xl truncate">${escapeHtml(saved.username)}</div>
            <div id="pp-email" class="text-sm text-gray-600 truncate">${escapeHtml(saved.email || '')}</div>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div class="text-gray-500">Prénom</div>
            <div id="pp-firstName" class="font-medium">${escapeHtml(saved.firstName || '')}</div>
          </div>
          <div>
            <div class="text-gray-500">Nom</div>
            <div id="pp-lastName" class="font-medium">${escapeHtml(saved.lastName || '')}</div>
          </div>
        </div>
      </section>

      <div class="lg:col-span-2 space-y-6">
        <!-- Infos de base -->
        <section class="rounded-2xl border bg-white shadow-sm p-6">
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Informations de base</h2>
          <form id="profile-form" class="space-y-5" novalidate>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="block">
                <span class="text-sm text-gray-700">Prénom</span>
                <input id="pf-firstName" type="text"
                  class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value="${escapeAttr(saved.firstName || '')}">
              </label>
              <label class="block">
                <span class="text-sm text-gray-700">Nom</span>
                <input id="pf-lastName" type="text"
                  class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value="${escapeAttr(saved.lastName || '')}">
              </label>
            </div>

            <label class="block">
              <span class="text-sm text-gray-700">Nom d'utilisateur</span>
              <input id="pf-username" type="text"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                value="${escapeAttr(saved.username)}">
            </label>

            <label class="block">
              <span class="text-sm text-gray-700">Email</span>
              <input id="pf-email" type="email"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                value="${escapeAttr(saved.email || '')}">
            </label>

            <div class="flex items-center justify-between gap-4">
              <p id="pf-msg" class="text-sm min-h-5" aria-live="polite"></p>
              <div class="flex items-center gap-3">
                <button id="pf-cancel" type="button"
                  class="px-4 py-2 rounded-lg border hover:bg-gray-50">Annuler</button>
                <button id="pf-save" type="submit"
                  class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Enregistrer</button>
              </div>
            </div>
          </form>
        </section>

        <!-- Avatar -->
        <section class="rounded-2xl border bg-white shadow-sm p-6">
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-2">Avatar</h2>
          <p class="text-xs text-gray-500 mb-3">Les changements d’avatar sont enregistrés automatiquement.</p>

          <div class="grid grid-cols-3 sm:grid-cols-6 gap-3" id="avatar-grid">
            ${AVATARS.map(src => `
              <button type="button"
                      class="group relative rounded-xl overflow-hidden ring-1 ring-black/10 hover:ring-blue-300 focus:outline-none"
                      data-avatar="${src}" aria-pressed="${src === currentAvatar ? 'true' : 'false'}">
                <img src="${src}" alt="" class="h-16 w-16 object-cover" data-avatar="${src}">
                <span class="pointer-events-none absolute inset-0 rounded-xl ${src === currentAvatar ? 'ring-2 ring-blue-600' : ''}"></span>
              </button>
            `).join('')}
          </div>

          <div class="mt-3 flex items-center gap-3">
            <button id="btn-apply-url" type="button"
              class="px-3 py-2 rounded-lg border hover:bg-gray-50">Appliquer</button>
          </div>

          <p id="av-msg" class="text-sm min-h-5 mt-2" aria-live="polite"></p>
        </section>

        <!-- Sécurité -->
        <section class="rounded-2xl border bg-white shadow-sm p-6">
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Sécurité</h2>
          <form id="pwd-form" class="space-y-4" novalidate>
            <label class="block">
              <span class="text-sm text-gray-700">Mot de passe actuel</span>
              <input id="pf-oldpwd" type="password"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500">
            </label>
            <label class="block">
              <span class="text-sm text-gray-700">Nouveau mot de passe</span>
              <input id="pf-newpwd" type="password"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500">
            </label>
            <label class="block">
              <span class="text-sm text-gray-700">Confirmer le nouveau mot de passe</span>
              <input id="pf-newpwd2" type="password"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500">
            </label>

            <div class="flex items-center justify-between gap-4">
              <p id="pwd-msg" class="text-sm min-h-5" aria-live="polite"></p>
              <button id="pwd-save" type="submit"
                class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Changer</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  `;

  // ==== refs ====
  const $ = <T extends HTMLElement>(s: string) => 
  {
    const el = container.querySelector<T>(s);
    if (!el) throw new Error(`Élément introuvable: ${s}`);
    return el;
  };


  // identité
  const card = 
  {
    avatar:   $<HTMLImageElement>('#pp-avatar'),
    username: $<HTMLElement>('#pp-username'),
    email:    $<HTMLElement>('#pp-email'),
    first:    $<HTMLElement>('#pp-firstName'),
    last:     $<HTMLElement>('#pp-lastName'),
  };
  card.avatar.addEventListener('error', () => { card.avatar.src = '/avatar/default.png'; }, { once: true });

  // avatar (feature dédiée)
  initChangeAvatar({
    grid:        $<HTMLDivElement>('#avatar-grid'),
    previewImg:  card.avatar,
    urlInput:    $<HTMLInputElement>('#pf-avatarUrl'),
    applyUrlBtn: $<HTMLButtonElement>('#btn-apply-url'),
    messageEl:   $<HTMLParagraphElement>('#av-msg'),
    initialValue: currentAvatar,
    avatars: AVATARS,
    debounceMs: 250,
    fallback: '/avatar/default.png',
  });

  // infos de base (feature dédiée)
  initUpdateBasics({
    user: saved,
    formEl:   $<HTMLFormElement>('#profile-form'),
    saveBtn:  $<HTMLButtonElement>('#pf-save'),
    cancelBtn:$<HTMLButtonElement>('#pf-cancel'),
    msgEl:    $<HTMLElement>('#pf-msg'),
    firstName:$<HTMLInputElement>('#pf-firstName'),
    lastName: $<HTMLInputElement>('#pf-lastName'),
    username: $<HTMLInputElement>('#pf-username'),
    email:    $<HTMLInputElement>('#pf-email'),
    card: {
      usernameEl: card.username,
      emailEl:    card.email,
      firstNameEl:card.first,
      lastNameEl: card.last,
    }
  });

  // mot de passe (feature dédiée)
  initChangePassword({
    userId:   saved.userId,
    formEl:   $<HTMLFormElement>('#pwd-form'),
    oldInput: $<HTMLInputElement>('#pf-oldpwd'),
    newInput: $<HTMLInputElement>('#pf-newpwd'),
    newInput2:$<HTMLInputElement>('#pf-newpwd2'),
    saveBtn:  $<HTMLButtonElement>('#pwd-save'),
    msgEl:    $<HTMLElement>('#pwd-msg'),
  });
};

export default ProfilePage;

