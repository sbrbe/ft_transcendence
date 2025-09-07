import { navigateTo } from '../router/router';
import { createAuthAccount, deleteAuthAccount } from '../api/auth';
import { createUserProfile } from '../api/users';
import { RegisterFormData } from '../utils/interface';
import { bindPasswordToggle, setStatusMessage, clearStatusMessage, lockButton } from '../utils/ui';
import { getInputValue } from '../utils/dom';

/**
 * [UI][ROUTER] Register :
 * Rend le formulaire de création de compte, gère l’UI (toggle password),
 * valide les champs et orchestre l’enchaînement des appels API :
 * 1) création compte auth → 2) création profil users → redirection /connexion.
 * En cas d’échec en 2), effectue un rollback en supprimant le compte auth.
 */
const Register: (container: HTMLElement) => void = (container) => {
	container.innerHTML = `
		<div class="container-page my-10">
			<div class="mx-auto max-w-md rounded-2xl border shadow-sm bg-white px-6 py-8">
				<h2 class="text-2xl font-semibold text-center text-gray-800">Create an user</h2>

				<form id="register-form" class="mt-6 space-y-4" novalidate>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<label class="block">
							<span class="text-sm text-gray-700">Firstname</span>
							<input id="firstName" name="firstName" type="text" required
								class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="Firstname">
						</label>
						<label class="block">
							<span class="text-sm text-gray-700">Lastname</span>
							<input id="lastName" name="lastName" type="text" required
								class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="Lastname">
						</label>
					</div>

					<label class="block">
						<span class="text-sm text-gray-700">Username</span>
						<input id="username" name="username" type="text" required
							class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="john_doe">
					</label>

					<label class="block">
						<span class="text-sm text-gray-700">Email</span>
						<input id="email" name="email" type="email" required
							class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@domain.com" autocomplete="email">
					</label>

					<label class="block">
						<span class="text-sm text-gray-700">Password</span>
						<div class="relative">
							<input id="password" name="password" type="password" required minlength="6"
								class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500 pr-10" placeholder="******" autocomplete="new-password">
							<button type="button" id="togglePwd"
								class="absolute inset-y-0 right-0 my-auto mr-2 text-xs text-gray-500 hover:text-gray-700">Show</button>
						</div>
					</label>

					<button id="submitBtn" type="submit"
						class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition">
						Create account
					</button>

					<p id="formMsg" class="text-sm min-h-5" aria-live="polite"></p>
				</form>
			</div>
		</div>
	`;

	const form = container.querySelector<HTMLFormElement>('#register-form')!;
	const msgEl = container.querySelector<HTMLParagraphElement>('#formMsg')!;
	const submitBtn = container.querySelector<HTMLButtonElement>('#submitBtn')!;
	const togglePwdBtn = container.querySelector<HTMLButtonElement>('#togglePwd')!;
	const pwdInput = container.querySelector<HTMLInputElement>('#password')!;

	bindPasswordToggle(pwdInput, togglePwdBtn);


	form.addEventListener('submit', async (e) => 
	{
		e.preventDefault();
		clearStatusMessage(msgEl);

		 const data: RegisterFormData = 
		 {
			 firstName: getInputValue(container, '#firstName'),
			 lastName:	getInputValue(container, '#lastName'),
			 username:	getInputValue(container, '#username'),
			 email:		 getInputValue(container, '#email'),
			 password:	getInputValue(container, '#password'),
		 };

		if (!data.firstName || !data.lastName || !data.username || !data.email || !data.password) 
		{
			return setStatusMessage(msgEl, 'Please complete all fields.', 'error');
		}
		if (data.password.length < 8) 
		{
			return setStatusMessage(msgEl, 'Password must have at least 8 characters.', 'error');
		}

		const { ok, errors, cleaned } = validateRegister({
			firstName: data.firstName,
			lastName: data.lastName,
			username: data.username,
		});
		 if (!ok) {
			const errMsg = errors.firstName || errors.lastName || errors.username || 'Fields invalids';
			setStatusMessage(msgEl, errMsg, 'error');
			return;
		}

		data.firstName = casing(cleaned.firstName);
		data.lastName = casing(cleaned.lastName);
		data.username = casing(cleaned.username);

		lockButton(submitBtn, true, 'Creating…');

		let createdUserId = '';
		try 
		{
			createdUserId = await createAuthAccount(data.email, data.password);
			await createUserProfile(createdUserId, data);

			setStatusMessage(msgEl, 'Account created. You can log in', 'success');
			setTimeout(() => navigateTo('/connection'), 400);
		} 
		catch (err: any) 
		{
			if (createdUserId) await deleteAuthAccount(createdUserId);
			setStatusMessage(msgEl, `Erreur : ${err?.message ?? 'Failed to create'}`, 'error');
		} 
		finally 
		{
			lockButton(submitBtn, false);
		}
	});

	const reName = /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u;
	const reUsername = /^[\p{L}\p{M}]{3,30}$/u;
	const casing = (s: string) =>
		 s ? s.charAt(0).toLocaleUpperCase('fr-FR') + s.slice(1).toLocaleLowerCase('fr-FR') : s;

	type RegisterFields = {
		firstName: string;
		lastName: string;
		username: string;
	};

	type ValidationResult = {
		ok: boolean;
		errors: Partial<Record<keyof RegisterFields, string>>;
		cleaned: RegisterFields;
	};

	function clean(str: string): string {
		return str
			.normalize('NFKC')
			.replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')
			.replace(/\u2019/g, "'")
			.trim();
	}

	function validateName(field: string, value: string): string | null {
		const cleaned = clean(value);
		if (!cleaned) {
			return (`Field ${field} is required`);
		}
		if (cleaned.length < 2) {
			return (`${field} must have 2 characters minimum`);
		}
		if (cleaned.length > 50) {
			return (`${field} must have 50 characters maximum`);
		}
		if (!reName.test(cleaned)) {
			return (`${field} can contain only letters, spaces or '-'`);
		}
		return null;
	}

	function validateUsername(value: string): string | null {
		const cleaned = clean(value);
		if (!cleaned) {
			return ('Username required');
		}
		if (!reUsername.test(cleaned)) {
			return ('The username can contain only letters, have a length between 2 and 20 characters and no spaces');
		}
		return null;
	}

	function validateRegister(fields: RegisterFields): ValidationResult {
		const cleaned: RegisterFields = {
			firstName: clean(fields.firstName),
			lastName: clean(fields.lastName),
			username: clean(fields.username),
		};

		const errors: ValidationResult['errors'] = {};

		const error1 = validateName('firstName', cleaned.firstName);
		if (error1){
			errors.firstName = error1;
		}
		const error2 = validateName('lastName', cleaned.lastName);
		if (error2) {
			errors.lastName = error2;
		}
		const error3 = validateUsername(cleaned.username);
		if (error3) {
			errors.username = error3;
		}

		return { ok: Object.keys(errors).length === 0, errors, cleaned };
	}

};

export default Register;
