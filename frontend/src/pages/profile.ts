import { navigateTo } from '../router/router';
import { getSavedUser, setLoggedInUser } from '../utils/ui';
import { AppUser } from '../utils/interface';
import { updateEmail, updatePassword } from '../api/auth';
import { updateUser } from '../api/users';
import { initChangeAvatar } from '../features/changeAvatar';
import { setStatusMessage, clearStatusMessage, lockButton, normaliseAvatar, escapeAttr, escapeHtml } from '../utils/ui';

const AVATARS = [
  '/avatar/default.png',
  '/avatar/avatar1.png',
  '/avatar/avatar2.png',
  '/avatar/avatar3.png',
  '/avatar/avatar4.png',
  '/avatar/avatar5.png',
];

interface ProfileForm {
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

  const currentAvatar = normaliseAvatar(saved.avatarPath) || AVATARS[0];

  container.innerHTML = `
    <div class="container-page my-10 grid gap-6 lg:grid-cols-3">
      <!-- Identité (aperçu) -->
      <section class="rounded-2xl border bg-white shadow-sm p-6 h-max">
        <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Identity</h2>
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
            <div class="text-gray-500">First Name</div>
            <div id="pp-firstName" class="font-medium">${escapeHtml(saved.firstName || '')}</div>
          </div>
          <div>
            <div class="text-gray-500">Last Name</div>
            <div id="pp-lastName" class="font-medium">${escapeHtml(saved.lastName || '')}</div>
          </div>
        </div>
      </section>

      <!-- Colonne droite : formulaires -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Informations de base -->
        <section class="rounded-2xl border bg-white shadow-sm p-6">
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Profil</h2>
          <form id="profile-form" class="space-y-5" novalidate>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="block">
                <span class="text-sm text-gray-700">First Name</span>
                <input id="pf-firstName" type="text"
                  class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value="${escapeAttr(saved.firstName || '')}">
              </label>
              <label class="block">
                <span class="text-sm text-gray-700">LastName</span>
                <input id="pf-lastName" type="text"
                  class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value="${escapeAttr(saved.lastName || '')}">
              </label>
            </div>

            <label class="block">
              <span class="text-sm text-gray-700">Username</span>
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
                  class="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
                <button id="pf-save" type="submit"
                  class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save</button>
              </div>
            </div>
          </form>
        </section>

        <!-- Avatar -->
        <section class="rounded-2xl border bg-white shadow-sm p-6">
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-2">Avatar</h2>
          <p class="text-xs text-gray-500 mb-3">Avatars are updated automatically.</p>

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
            <input id="pf-avatarPath" type="url" placeholder="Ou URL personnalisée (https://...)"
              class="flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              value="${escapeAttr(currentAvatar)}">
            <button id="btn-apply-url" type="button"
              class="px-3 py-2 rounded-lg border hover:bg-gray-50">Submit</button>
          </div>

          <!-- Upload direct -->
          <div class="mt-4 space-y-3">
            <div class="flex items-center gap-3">
              <button id="btn-upload" type="button"
                  class="px-3 py-2 rounded-lg border hover:bg-gray-50">
                  Upload an avatar
              </button>
              <input id="file-input" type="file" accept="image/*" class="hidden">
              <img id="avatar-preview" alt="Prévisualisation avatar"
                  class="h-10 w-10 rounded-full ring-1 ring-black/10 object-cover hidden">
           </div>

          <p id="av-msg" class="text-sm min-h-5 mt-2" aria-live="polite"></p>
        </section>

        <!-- Sécurité -->
        <section class="rounded-2xl border bg-white shadow-sm p-6">
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Security</h2>
          <form id="pwd-form" class="space-y-4" novalidate>
            <label class="block">
              <span class="text-sm text-gray-700">Old password</span>
              <input id="pf-oldpwd" type="password"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500">
            </label>
            <label class="block">
              <span class="text-sm text-gray-700">New password</span>
              <input id="pf-newpwd" type="password"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500">
            </label>
            <label class="block">
              <span class="text-sm text-gray-700">Confirm new password</span>
              <input id="pf-newpwd2" type="password"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500">
            </label>

            <div class="flex items-center justify-between gap-4">
              <p id="pwd-msg" class="text-sm min-h-5" aria-live="polite"></p>
              <button id="pwd-save" type="submit"
                class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Save</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  `;
  const pwdForm = container.querySelector<HTMLFormElement>('#pwd-form')!;
  const profileForm = container.querySelector<HTMLFormElement>('#profile-form')!;

  const profile = {
    firstName: container.querySelector<HTMLInputElement>('#pf-firstName')!,
    lastName: container.querySelector<HTMLInputElement>('#pf-lastName')!,
    email: container.querySelector<HTMLInputElement>('#pf-email')!,
    username: container.querySelector<HTMLInputElement>('#pf-username')!,
    saveBtn: container.querySelector<HTMLButtonElement>('#pf-save')!,
    cancelBtn: container.querySelector<HTMLButtonElement>('#pf-cancel')!,
    msg: container.querySelector<HTMLParagraphElement>('#pf-msg')!,
    card: {
      avatar: container.querySelector<HTMLImageElement>('#pp-avatar')!,
      username: container.querySelector<HTMLDivElement>('#pp-username')!,
      email: container.querySelector<HTMLDivElement>('#pp-email')!,
      firstName: container.querySelector<HTMLDivElement>('#pp-firstName')!,
      lastName: container.querySelector<HTMLDivElement>('#pp-lastName')!,
    },
  };

  const avatar = {
    grid: container.querySelector<HTMLDivElement>('#avatar-grid')!,
    urlInput: container.querySelector<HTMLInputElement>('#pf-avatarPath')!,
    applyUrlBtn: container.querySelector<HTMLButtonElement>('#btn-apply-url')!,
    msg: container.querySelector<HTMLParagraphElement>('#av-msg')!,
  };

  const pwd = {
    old: container.querySelector<HTMLInputElement>('#pf-oldpwd')!,
    n1: container.querySelector<HTMLInputElement>('#pf-newpwd')!,
    n2: container.querySelector<HTMLInputElement>('#pf-newpwd2')!,
    saveBtn: container.querySelector<HTMLButtonElement>('#pwd-save')!,
    msg: container.querySelector<HTMLParagraphElement>('#pwd-msg')!,
  };

  // fallback preview identité si l’image casse
  profile.card.avatar.addEventListener('error', () => { profile.card.avatar.src = '/avatar/default.png'; }, { once: true });

  /* ---------- avatar: branche la feature dédiée ---------- */
  initChangeAvatar({
    grid: avatar.grid,
    previewImg: profile.card.avatar,
    urlInput: avatar.urlInput,
    applyUrlBtn: avatar.applyUrlBtn,
    messageEl: avatar.msg,
    initialValue: currentAvatar,
    avatars: AVATARS,
    debounceMs: 250,
    fallback: '/avatar/default.png',
  });

  /* ---------- Annuler (réinitialise seulement les champs texte) ---------- */
  profile.cancelBtn.addEventListener('click', () => {
    const user = getSavedUser<AppUser>() ?? saved;
    profile.firstName.value = user.firstName || '';
    profile.lastName.value = user.lastName || '';
    profile.username.value = user.username || '';
    profile.email.value = user.email || '';
    setStatusMessage(profile.msg);
  });

  /* ---------- Enregistrer (infos de base + email) ---------- */
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data: ProfileForm = {
      firstName: profile.firstName.value.trim(),
      lastName: profile.lastName.value.trim(),
      email: profile.email.value.trim(),
      username: profile.username.value.trim(),
    };

    lockButton(profile.saveBtn, true, 'Saving…');
    setStatusMessage(profile.msg);

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
        avatarPath: latest.avatarPath, // <= ne pas écraser l’avatar auto-sauvé
      };

      setLoggedInUser(merged);
      window.dispatchEvent(new CustomEvent('auth:changed', { detail: merged }));

      // rafraîchir la carte identité
      profile.card.username.textContent = merged.username || '';
      profile.card.email.textContent = merged.email || '';
      profile.card.firstName.textContent = merged.firstName || '';
      profile.card.lastName.textContent = merged.lastName || '';

      setStatusMessage(profile.msg, '✅ Infos updated', 'success');
    } catch (err: any) {
      setStatusMessage(profile.msg, `❌ ${err?.message || 'Error while updating'}`, 'error');
    } finally {
      lockButton(profile.saveBtn, false);
    }
  });

  /* ---------- Changer mot de passe ---------- */
  pwdForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatusMessage(pwd.msg);

    const oldPwd = pwd.old.value.trim();
    const newPwd = pwd.n1.value.trim();
    const newPwd2 = pwd.n2.value.trim();

    if (!oldPwd || !newPwd) return setStatusMessage(pwd.msg, '❌ Fields required.', 'error');
    if (newPwd !== newPwd2) return setStatusMessage(pwd.msg, '❌ Passwords dont match.', 'error');

    lockButton(pwd.saveBtn, true, 'Updating…');

    try {
      await updatePassword(saved.userId, oldPwd, newPwd);
      setStatusMessage(pwd.msg, '✅ Password updated !', 'success');
      pwd.old.value = ''; pwd.n1.value = ''; pwd.n2.value = '';
    } catch (err: any) {
      setStatusMessage(pwd.msg, `❌ ${err?.message || 'Error while updating pasword'}`, 'error');
    } finally {
      lockButton(pwd.saveBtn, false);
    }
  });
};

export default ProfilePage;