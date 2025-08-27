// src/pages/profile.ts
import { navigateTo } from '../router/router';
import { getSavedUser, setLoggedInUser, AppUser } from '../api/auth';
import { updateUser, updateEmail, updatePassword } from '../api/profile';
import { initChangeAvatar } from '../features/changeAvatar';

const AVATARS = [
  '/avatar/default.png',
  '/avatar/avatar1.png',
  '/avatar/avatar2.png',
  '/avatar/avatar3.png',
  '/avatar/avatar4.png',
  '/avatar/avatar5.png',
];

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};

const ProfilePage: (container: HTMLElement) => void = (container) => {
  const saved = getSavedUser<AppUser>();
  if (!saved) {
    navigateTo('/connexion');
    return;
  }

  const currentAvatar = normaliseAvatar(saved.avatarUrl) || AVATARS[0];

  container.innerHTML = `
    <div class="container-page my-10 grid gap-6 lg:grid-cols-3">
      <!-- Identité (aperçu) -->
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

      <!-- Colonne droite : formulaires -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Informations de base -->
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
            <input id="pf-avatarUrl" type="url" placeholder="Ou URL personnalisée (https://...)"
              class="flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              value="${escapeAttr(currentAvatar)}">
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

  /* ---------- helpers (scopés au container) ---------- */
  const $ = <T extends HTMLElement>(sel: string): T => {
    const el = container.querySelector<T>(sel);
    if (!el) throw new Error(`Élément introuvable: ${sel}`);
    return el;
  };
  const setMsg = (el: HTMLElement, text = '', kind?: 'success'|'error') => {
    el.textContent = text;
    el.className = `text-sm ${kind === 'success' ? 'text-green-600' : kind === 'error' ? 'text-red-600' : ''}`;
  };
  const lockBtn = (btn: HTMLButtonElement, disabled: boolean, label?: string) => {
    btn.disabled = disabled;
    btn.classList.toggle('opacity-70', disabled);
    btn.classList.toggle('cursor-not-allowed', disabled);
    if (label && disabled) btn.textContent = label;
  };

  /* ---------- refs ---------- */
  const pf = {
    firstName: $<HTMLInputElement>('#pf-firstName'),
    lastName: $<HTMLInputElement>('#pf-lastName'),
    email: $<HTMLInputElement>('#pf-email'),
    username: $<HTMLInputElement>('#pf-username'),
    saveBtn: $<HTMLButtonElement>('#pf-save'),
    cancelBtn: $<HTMLButtonElement>('#pf-cancel'),
    msg: $<HTMLParagraphElement>('#pf-msg'),
    card: {
      avatar: $<HTMLImageElement>('#pp-avatar'),
      username: $<HTMLDivElement>('#pp-username'),
      email: $<HTMLDivElement>('#pp-email'),
      firstName: $<HTMLDivElement>('#pp-firstName'),
      lastName: $<HTMLDivElement>('#pp-lastName'),
    },
  };
  const av = {
    grid: $<HTMLDivElement>('#avatar-grid'),
    urlInput: $<HTMLInputElement>('#pf-avatarUrl'),
    applyUrlBtn: $<HTMLButtonElement>('#btn-apply-url'),
    msg: $<HTMLParagraphElement>('#av-msg'),
  };
  const pwd = {
    old: $<HTMLInputElement>('#pf-oldpwd'),
    n1: $<HTMLInputElement>('#pf-newpwd'),
    n2: $<HTMLInputElement>('#pf-newpwd2'),
    saveBtn: $<HTMLButtonElement>('#pwd-save'),
    msg: $<HTMLParagraphElement>('#pwd-msg'),
  };

  // fallback preview identité si l’image casse
  pf.card.avatar.addEventListener('error', () => { pf.card.avatar.src = '/avatar/default.png'; }, { once: true });

  /* ---------- avatar: branche la feature dédiée ---------- */
  initChangeAvatar({
    grid: av.grid,
    previewImg: pf.card.avatar,
    urlInput: av.urlInput,
    applyUrlBtn: av.applyUrlBtn,
    messageEl: av.msg,
    initialValue: currentAvatar,
    avatars: AVATARS,
    debounceMs: 250,
    fallback: '/avatar/default.png',
  });

  /* ---------- Annuler (réinitialise seulement les champs texte) ---------- */
  pf.cancelBtn.addEventListener('click', () => {
    pf.firstName.value = saved.firstName || '';
    pf.lastName.value = saved.lastName || '';
    pf.username.value = saved.username || '';
    pf.email.value = saved.email || '';
    setMsg(pf.msg);
  });

  /* ---------- Enregistrer (infos de base + email) ---------- */
  ($<HTMLFormElement>('#profile-form')).addEventListener('submit', async (e) => {
    e.preventDefault();

    const data: ProfileForm = {
      firstName: pf.firstName.value.trim(),
      lastName: pf.lastName.value.trim(),
      email: pf.email.value.trim(),
      username: pf.username.value.trim(),
    };

    lockBtn(pf.saveBtn, true, 'Enregistrement…');
    setMsg(pf.msg);

    try {
      // avatar est géré automatiquement par la feature
      const updatedUser = await updateUser(saved.userId, {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
      });
      const updatedEmail = await updateEmail(saved.userId, data.email);

      // conserver l’avatar courant depuis le storage (mis à jour par la feature)
      const latest = getSavedUser<AppUser>() || saved;

      const merged: AppUser = {
        userId: saved.userId,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        email: updatedEmail.email,
        avatarUrl: latest.avatarUrl, // <= ne pas écraser l’avatar auto-sauvé
      };

      setLoggedInUser(merged);
      window.dispatchEvent(new CustomEvent('auth:changed', { detail: merged }));

      // rafraîchir la carte identité
      pf.card.username.textContent = merged.username || '';
      pf.card.email.textContent = merged.email || '';
      pf.card.firstName.textContent = merged.firstName || '';
      pf.card.lastName.textContent = merged.lastName || '';

      setMsg(pf.msg, '✅ Modifications enregistrées', 'success');
    } catch (err: any) {
      setMsg(pf.msg, `❌ ${err?.message || 'Erreur lors de la mise à jour'}`, 'error');
    } finally {
      lockBtn(pf.saveBtn, false);
    }
  });

  /* ---------- Changer mot de passe ---------- */
  ($<HTMLFormElement>('#pwd-form')).addEventListener('submit', async (e) => {
    e.preventDefault();
    setMsg(pwd.msg);

    const oldPwd = pwd.old.value.trim();
    const newPwd = pwd.n1.value.trim();
    const newPwd2 = pwd.n2.value.trim();

    if (!oldPwd || !newPwd) return setMsg(pwd.msg, '❌ Champs requis.', 'error');
    if (newPwd !== newPwd2) return setMsg(pwd.msg, '❌ Les mots de passe ne correspondent pas.', 'error');

    lockBtn(pwd.saveBtn, true, 'Mise à jour…');

    try {
      await updatePassword(saved.userId, oldPwd, newPwd);
      setMsg(pwd.msg, '✅ Mot de passe modifié avec succès !', 'success');
      pwd.old.value = ''; pwd.n1.value = ''; pwd.n2.value = '';
    } catch (err: any) {
      setMsg(pwd.msg, `❌ ${err?.message || 'Erreur lors du changement de mot de passe'}`, 'error');
    } finally {
      lockBtn(pwd.saveBtn, false);
    }
  });
};

export default ProfilePage;

/* ------------------------------ Utils ------------------------------ */

function normaliseAvatar(input?: string | null): string {
  if (!input) return '';
  const s = input.trim();
  if (!s) return '';
  if (/^(https?:|data:|blob:)/i.test(s)) return s;
  const p = s.replace(/^\/+/, '');
  if (p.startsWith('avatar/')) return '/' + p;
  if (!p.includes('/')) return '/avatar/' + p;
  return '/' + p;
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]!));
}
function escapeAttr(s: string) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}
