import { navigateTo } from '../router/router';
import { getSavedUser, setLoggedInUser } from '../utils/ui';
import { AppUser } from '../utils/interface';
import { updateEmail, updatePassword } from '../api/auth';
import { updateUser } from '../api/users';
import { setStatusMessage, lockButton, bindPasswordToggle, escapeHtml } from '../utils/ui';
import { validateRegister, casing } from '../api/validateData';
import { initChangeAvatar } from '../features/changeAvatar';
import { initUploadAvatar } from '../features/uploadAvatar';

import { listUserAvatars, isUploadedAvatar } from '../api/avatar';

interface ProfileForm {
	firstName: string;
	lastName: string;
	email: string;
	username: string;
}

const ProfilePage: (container: HTMLElement) => void = (container) => {
	const saved = getSavedUser<AppUser>();
	if (!saved) {
		navigateTo('/connection');
		return;
	}

	container.innerHTML = `
			<div class="container-page my-10 grid gap-6 lg:grid-cols-3">
			<!-- Identité -->
			<section class="rounded-2xl border bg-white shadow-sm p-6 h-max">
				<h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Identity</h2>
				<div class="flex items-center gap-4">
					<img id="pp-avatar" src="${escapeHtml(saved.avatarPath || '/avatar/default.png')}" alt="Avatar"
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

			<!-- Colonne droite -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Profil -->
				<section class="rounded-2xl border bg-white shadow-sm p-6">
					<h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Profil</h2>
					<form id="profile-form" class="space-y-5" novalidate>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<label class="block">
								<span class="text-sm text-gray-700">First Name</span>
								<input id="pf-firstName" type="text"
									class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
									value="${escapeHtml(saved.firstName || '')}">
							</label>
							<label class="block">
								<span class="text-sm text-gray-700">Last Name</span>
								<input id="pf-lastName" type="text"
									class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
									value="${escapeHtml(saved.lastName || '')}">
							</label>
						</div>

						<label class="block">
							<span class="text-sm text-gray-700">Username</span>
							<input id="pf-username" type="text"
								class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
								value="${escapeHtml(saved.username)}">
						</label>

						<label class="block">
							<span class="text-sm text-gray-700">Email</span>
							<input id="pf-email" type="email"
								class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
								value="${escapeHtml(saved.email || '')}">
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
					<p class="text-xs text-gray-500 mb-3">Choisissez un avatar prédéfini</p>
					<div class="grid grid-cols-3 sm:grid-cols-6 gap-3" id="avatar-grid"></div>
					<p id="av-msg" class="text-sm min-h-5 mt-2" aria-live="polite"></p>
				</section>

				<!-- Upload avatar -->
				<section class="rounded-2xl border bg-white shadow-sm p-6">
					<h2 class="text-sm uppercase tracking-wider text-gray-500 mb-2">Importer votre avatar</h2>
					<p class="text-xs text-gray-500 mb-3">Choisissez un fichier PNG ou JPEG.</p>
					<div class="flex items-center gap-3">
						<button id="btn-upload-avatar" type="button"
							class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Upload</button>
						<input id="file-input-avatar" type="file" accept="image/png,image/jpeg" class="hidden">
						<p id="upload-msg" class="text-sm min-h-5 ml-3" aria-live="polite"></p>
					</div>
				</section>

				<!-- Security -->
<section class="rounded-2xl border bg-white shadow-sm p-6">
  <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Security</h2>
  <form id="pwd-form" class="space-y-4" novalidate>
    <label class="block">
      <span class="text-sm text-gray-700">Old password</span>
      <div class="relative">
        <input id="pf-oldpwd" type="password"
               class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
               autocomplete="current-password" placeholder="********">
        <button type="button" id="toggleOldPwd"
                class="absolute inset-y-0 right-0 my-auto mr-2 text-xs text-gray-500 hover:text-gray-700 toggle-pwd"
                data-target="pf-oldpwd" aria-label="Show password">Show</button>
      </div>
    </label>

    <label class="block">
      <span class="text-sm text-gray-700">New password</span>
      <div class="relative">
        <input id="pf-newpwd" type="password"
               class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
               autocomplete="new-password" placeholder="********">
        <button type="button" id="toggleNewPwd"
                class="absolute inset-y-0 right-0 my-auto mr-2 text-xs text-gray-500 hover:text-gray-700 toggle-pwd"
                data-target="pf-newpwd" aria-label="Show password">Show</button>
      </div>
    </label>

    <label class="block">
      <span class="text-sm text-gray-700">Confirm new password</span>
      <div class="relative">
        <input id="pf-newpwd2" type="password"
               class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
               autocomplete="new-password" placeholder="********">
        <button type="button" id="toggleNewPwd2"
                class="absolute inset-y-0 right-0 my-auto mr-2 text-xs text-gray-500 hover:text-gray-700 toggle-pwd"
                data-target="pf-newpwd2" aria-label="Show password">Show</button>
      </div>
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
	const avatarGrid = container.querySelector<HTMLDivElement>("#avatar-grid")!;
	
	profileForm.addEventListener('keydown', (e: KeyboardEvent) => {
		const t = e.target as HTMLElement | null;
		if (e.key === 'Enter' && t && t.tagName !== 'BUTTON') {
			e.preventDefault();
		}
	});

	pwdForm.addEventListener('keydown', (e: KeyboardEvent) => {
	const t = e.target as HTMLElement | null;
	if (e.key === 'Enter' && t && t.tagName !== 'BUTTON') {
		e.preventDefault();
	}
	});

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

	const pwd = {
		old: container.querySelector<HTMLInputElement>('#pf-oldpwd')!,
		n1: container.querySelector<HTMLInputElement>('#pf-newpwd')!,
		n2: container.querySelector<HTMLInputElement>('#pf-newpwd2')!,
		saveBtn: container.querySelector<HTMLButtonElement>('#pwd-save')!,
		msg: container.querySelector<HTMLParagraphElement>('#pwd-msg')!,
	};
	
	const toggleOldPwd = container.querySelector<HTMLButtonElement>('#toggleOldPwd')!;
	(bindPasswordToggle(pwd.old, toggleOldPwd));
	const toggleNewPwd = container.querySelector<HTMLButtonElement>('#toggleNewPwd')!;
	(bindPasswordToggle(pwd.n1, toggleNewPwd));
	const toggleNewPwd2 = container.querySelector<HTMLButtonElement>('#toggleNewPwd2')!;
	(bindPasswordToggle(pwd.n2, toggleNewPwd2));

	profile.card.avatar.addEventListener('error', () => {
		profile.card.avatar.src = '/avatar/default.png';
	}, { once: true });


	(async () => {
		const defaults = [
			'/avatar/default.png',
			'/avatar/avatar1.png',
			'/avatar/avatar2.png',
			'/avatar/avatar3.png',
			'/avatar/avatar4.png',
			'/avatar/avatar5.png',
		];

		let uploaded: string[] = [];
		try {
			uploaded = await listUserAvatars(saved.userId);
		} catch (e) {
			console.warn('[avatars] listUserAvatars failed:', e);
		}

		const fallback = isUploadedAvatar(saved.avatarPath) ? [saved.avatarPath as string] : [];

		const merged = Array.from(new Set<string>([...fallback, ...uploaded, ...defaults]));
		console.log('[avatars] merged list:', merged);

		initChangeAvatar({
			grid: avatarGrid,
			previewImg: profile.card.avatar,
			messageEl: container.querySelector<HTMLElement>('#av-msg')!,
			avatars: merged,
		});

		initUploadAvatar({
			button: container.querySelector<HTMLButtonElement>('#btn-upload-avatar')!,
			fileInput: container.querySelector<HTMLInputElement>('#file-input-avatar')!,
			messageEl: container.querySelector<HTMLElement>('#upload-msg')!,
			previewImg: profile.card.avatar,
			grid: avatarGrid,
		});
	})();

	profile.cancelBtn.addEventListener('click', () => {
		const user = getSavedUser<AppUser>() ?? saved;
		profile.firstName.value = user.firstName || '';
		profile.lastName.value = user.lastName || '';
		profile.username.value = user.username || '';
		profile.email.value = user.email || '';
		setStatusMessage(profile.msg);
	});

	profileForm.addEventListener('submit', async (e) => {
		e.preventDefault();

		const data: ProfileForm = {
			firstName: profile.firstName.value.trim(),
			lastName: profile.lastName.value.trim(),
			email: profile.email.value.trim(),
			username: profile.username.value.trim(),
		};

		const { ok, errors, cleaned } = validateRegister({
			firstName: data.firstName,
			lastName: data.lastName,
			username: data.username,
		});
		 if (!ok) {
			const errMsg = errors.firstName || errors.lastName || errors.username || 'Fields invalids';
			setStatusMessage(profile.msg, errMsg, 'error');
			return;
		}

		data.firstName = casing(cleaned.firstName);
		data.lastName = casing(cleaned.lastName);
		data.username = casing(cleaned.username);
		
		lockButton(profile.saveBtn, true, 'Saving…');
		setStatusMessage(profile.msg);

		try {
			const updatedUser = await updateUser(saved.userId, {
				firstName: data.firstName,
				lastName: data.lastName,
				username: data.username,
			});
			const updatedEmail = await updateEmail(saved.userId, data.email);

			const latest = getSavedUser<AppUser>() || saved;

			const merged: AppUser = {
				...latest,
				userId: saved.userId,
				firstName: updatedUser.firstName,
				lastName: updatedUser.lastName,
				username: updatedUser.username,
				email: updatedEmail.email,
			};

			setLoggedInUser(merged);
			window.dispatchEvent(new CustomEvent('auth:changed', { detail: merged }));

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
